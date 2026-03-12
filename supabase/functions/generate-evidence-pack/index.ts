import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EMPLOYEE_LABELS: Record<string, string> = {
  "1-10": "1–10 empleados",
  "11-50": "11–50 empleados",
  "51-200": "51–200 empleados",
  "201-500": "201–500 empleados",
  "500+": "Más de 500 empleados",
};

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDateES(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub as string;

    const { export_id, formats: requestedFormats } = await req.json();
    if (!export_id) return new Response(JSON.stringify({ error: "export_id required" }), { status: 400, headers: corsHeaders });
    const formats: string[] = Array.isArray(requestedFormats) && requestedFormats.length > 0 ? requestedFormats : ["pdf"];

    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Get export record
    const { data: exportRecord, error: exportErr } = await admin
      .from("report_exports")
      .select("*")
      .eq("id", export_id)
      .single();

    if (exportErr || !exportRecord) {
      return new Response(JSON.stringify({ error: "Export not found" }), { status: 404, headers: corsHeaders });
    }

    const orgId = exportRecord.organization_id;

    // Check subscription limits
    const { data: sub } = await admin
      .from("subscriptions")
      .select("*, plans(*)")
      .eq("tenant_id", orgId)
      .eq("tenant_type", "org")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub?.status === "suspended" || sub?.status === "cancelled") {
      await admin.from("report_exports").update({ status: "failed", error_message: "Subscription suspended/cancelled" }).eq("id", export_id);
      return new Response(JSON.stringify({ error: "Subscription not active" }), { status: 403, headers: corsHeaders });
    }

    const plan = sub?.plans as any;
    const maxExports = plan?.max_exports_per_month;
    if (maxExports) {
      const { data: meter } = await admin
        .from("usage_meters")
        .select("exports_count")
        .eq("tenant_id", orgId)
        .eq("tenant_type", "org")
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (meter && (meter.exports_count ?? 0) >= maxExports) {
        await admin.from("report_exports").update({ status: "failed", error_message: "Monthly export limit reached" }).eq("id", export_id);
        return new Response(JSON.stringify({ error: "Export limit reached" }), { status: 429, headers: corsHeaders });
      }
    }

    // Mark as generating
    await admin.from("report_exports").update({ status: "generating", started_at: new Date().toISOString() }).eq("id", export_id);

    // Fetch all data including billing
    const [orgRes, billingRes, useCasesRes, risksRes, controlsRes, evidencesRes, reqMapRes, rolesRes, auditRes, partnerRes] = await Promise.all([
      admin.from("organizations").select("*").eq("id", orgId).single(),
      admin.from("billing_profiles").select("*").eq("organization_id", orgId).maybeSingle(),
      admin.from("ai_use_cases").select("*").eq("organization_id", orgId).is("deleted_at", null).order("code"),
      admin.from("risks").select("*").eq("organization_id", orgId).is("deleted_at", null).order("code"),
      admin.from("controls").select("*").eq("organization_id", orgId).is("deleted_at", null).order("name"),
      admin.from("evidences").select("*").eq("organization_id", orgId).is("deleted_at", null).order("category"),
      admin.from("requirement_evidence_map").select("*").eq("organization_id", orgId).order("iso_clause"),
      admin.from("governance_roles").select("*").eq("organization_id", orgId),
      admin.from("audit_log").select("*").eq("organization_id", orgId).order("created_at", { ascending: false }).limit(50),
      // Fetch partner for branding if linked
      admin.from("organizations").select("partner_id").eq("id", orgId).single().then(async (r) => {
        if (r.data?.partner_id) {
          return admin.from("partners").select("*").eq("id", r.data.partner_id).single();
        }
        return { data: null };
      }),
    ]);

    const org = orgRes.data as any;
    const billing = billingRes.data as any;
    const partner = partnerRes.data as any;
    const useCases = useCasesRes.data ?? [];
    const risks = risksRes.data ?? [];
    const controls = controlsRes.data ?? [];
    const evidences = evidencesRes.data ?? [];
    const reqMap = reqMapRes.data ?? [];
    const roles = rolesRes.data ?? [];
    const auditLog = auditRes.data ?? [];

    const generatedAt = new Date().toISOString();
    const displayName = org?.trade_name || org?.legal_company_name || org?.name || "Organización";
    const legalName = org?.legal_company_name || "";
    const employeeLabel = EMPLOYEE_LABELS[org?.employee_range] || org?.employee_range || "";

    // Build billing address string
    const billingAddress = billing
      ? [billing.billing_address_line1, billing.billing_address_line2, billing.city, billing.postcode, billing.region, billing.country]
          .filter(Boolean)
          .join(", ")
      : "";

    // Build org profile object for manifest
    const organizationProfile = {
      display_name: displayName,
      legal_company_name: legalName,
      trade_name: org?.trade_name || null,
      tax_id: org?.tax_id || null,
      country: org?.country || null,
      sector: org?.sector || null,
      employee_range: org?.employee_range || null,
      employee_label: employeeLabel,
      website: org?.website || null,
      compliance_contact_name: org?.compliance_contact_name || null,
      compliance_contact_email: org?.compliance_contact_email || null,
      aims_scope: org?.aims_scope || null,
    };

    const billingProfile = billing
      ? {
          legal_name: billing.legal_name || null,
          vat_id: billing.vat_id || null,
          billing_email: billing.billing_email || null,
          billing_address: billingAddress || null,
        }
      : null;

    // Build manifest
    const manifest = {
      version: "2.0",
      generated_at: generatedAt,
      organization: { id: orgId, name: org?.name },
      organization_profile: organizationProfile,
      billing_profile: billingProfile,
      partner: partner ? { id: partner.id, name: partner.name } : null,
      plan: plan?.name ?? "unknown",
      counts: {
        ai_systems: useCases.length,
        risks: risks.length,
        controls: controls.length,
        evidences: evidences.length,
        requirements_mapped: reqMap.length,
      },
      iso_standard: "ISO/IEC 42001:2023",
    };

    // Build index.csv with optional org columns
    const csvHeader = "ID,Type,Name,Category,ISO_Clause,Status,Owner,Version,Created_At,Org_Name,Country,Sector";
    const orgCsvSuffix = `,"${esc(displayName)}","${esc(org?.country)}","${esc(org?.sector)}"`;
    const csvRows = [
      ...useCases.map((u: any) => `${u.code},AI_System,"${esc(u.name)}",${esc(u.department)},${esc(u.purpose)},${u.status},${esc(u.owner_name)},,${u.created_at}${orgCsvSuffix}`),
      ...risks.map((r: any) => `${r.code},Risk,"${esc(r.name)}",${esc(r.category)},${esc(r.iso_clause)},${r.status},,,${r.created_at}${orgCsvSuffix}`),
      ...controls.map((c: any) => `${c.id.slice(0, 8)},Control,"${esc(c.name)}",,${esc(c.iso_clause)},${c.status},${esc(c.owner_name)},,${c.created_at}${orgCsvSuffix}`),
      ...evidences.map((e: any) => `${e.id.slice(0, 8)},Evidence,"${esc(e.name)}",${esc(e.category)},${esc(e.iso_clause)},${e.status},${esc(e.owner_name)},${esc(e.version)},${e.created_at}${orgCsvSuffix}`),
    ];
    const indexCsv = [csvHeader, ...csvRows].join("\n");

    // Org data table row helper
    const orgRow = (label: string, value: string | null | undefined) =>
      `<tr><td style="font-weight:600;width:220px;color:#555">${esc(label)}</td><td>${value ? esc(value) : '<span style="color:#b8860b;font-style:italic">No informado</span>'}</td></tr>`;

    // Partner branding variables
    const pColor = partner?.primary_color || "#2d9c8f";
    const pLogoUrl = partner?.pdf_cover_logo_url || partner?.logo_url || null;
    const pBrandName = partner?.brand_name || partner?.name || null;
    const pFooterText = partner?.pdf_footer_text || (pBrandName ? `© ${pBrandName} ${new Date().getFullYear()}` : null);

    // Partner branding header on cover
    const partnerCoverBlock = pBrandName
      ? `<div style="margin-bottom:24px">${pLogoUrl ? `<img src="${esc(pLogoUrl)}" style="max-height:50px;margin-bottom:8px" alt="${esc(pBrandName)}" /><br/>` : ""}<span style="color:${esc(pColor)};font-weight:700;font-size:14px">${esc(pBrandName)}</span></div>`
      : "";

    // Build HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>Evidence Pack — ${esc(displayName)}</title><style>
body{font-family:'Segoe UI',system-ui,sans-serif;margin:0;padding:0;color:#1a1a2e;font-size:12px}
.cover{min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(135deg,#1a1a2e 0%,#2d3a4e 100%);color:#fff;padding:60px;text-align:center;page-break-after:always}
.cover h1{font-size:32px;margin:0 0 8px;color:${esc(pColor)}}
.cover .subtitle{font-size:18px;opacity:0.9;margin-bottom:32px}
.cover .org-name{font-size:22px;font-weight:700;margin-bottom:4px}
.cover .legal{font-size:14px;opacity:0.7}
.cover .meta{margin-top:40px;font-size:12px;opacity:0.6}
.cover .meta span{margin:0 12px}
.content{margin:40px;max-width:900px}
h2{color:${esc(pColor)};font-size:16px;margin-top:28px;border-bottom:2px solid ${esc(pColor)};padding-bottom:4px}
h3{font-size:13px;color:#444;margin-top:20px}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:11px}
th{background:#f0f4f8;text-align:left;padding:8px;border:1px solid #ddd;font-weight:600}
td{padding:6px 8px;border:1px solid #ddd;vertical-align:top}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600}
.met{background:#d4edda;color:#155724}.partial{background:#fff3cd;color:#856404}.gap{background:#f8d7da;color:#721c24}
.footer{margin-top:40px;border-top:2px solid ${esc(pColor)};padding-top:12px;font-size:10px;color:#666}
.org-section{background:#f8f9fa;border:1px solid #e0e0e0;border-radius:8px;padding:20px;margin:16px 0}
.org-section table{margin:0}
.org-section td{border:none;border-bottom:1px solid #eee;padding:8px 12px}
.org-section tr:last-child td{border-bottom:none}
@media print{.cover{page-break-after:always}.content{margin:20px}}
</style></head><body>

<!-- COVER PAGE -->
<div class="cover">
  ${partnerCoverBlock}
  <h1>ISO/IEC 42001:2023</h1>
  <div class="subtitle">Evidence Pack</div>
  <div class="org-name">${esc(displayName)}</div>
  ${legalName && displayName !== legalName ? `<div class="legal">${esc(legalName)}</div>` : ""}
  <div class="meta">
    <span>${esc(org?.country || "")}</span>
    <span>${esc(org?.sector || "")}</span>
    <span>${employeeLabel}</span>
  </div>
  ${org?.website ? `<div class="meta"><span>${esc(org.website)}</span></div>` : ""}
  <div class="meta" style="margin-top:40px">
    <span>Generado: ${formatDateES(generatedAt)}</span>
    <span>Pack v${manifest.version}</span>
  </div>
  ${org?.compliance_contact_email ? `<div class="meta"><span>Contacto: ${esc(org.compliance_contact_email)}</span></div>` : ""}
</div>

<!-- CONTENT -->
<div class="content">

<h2>1. Datos de la Organización</h2>
<div class="org-section">
  <table>
    ${orgRow("Nombre comercial", org?.trade_name)}
    ${orgRow("Razón social", legalName)}
    ${orgRow("CIF / NIF", org?.tax_id)}
    ${orgRow("País", org?.country)}
    ${orgRow("Sector / Industria", org?.sector)}
    ${orgRow("Tamaño", employeeLabel)}
    ${orgRow("Sitio web", org?.website)}
    ${orgRow("Contacto cumplimiento", org?.compliance_contact_name ? `${org.compliance_contact_name}${org.compliance_contact_email ? ` — ${org.compliance_contact_email}` : ""}` : null)}
    ${orgRow("Alcance AIMS", org?.aims_scope)}
    ${pBrandName ? orgRow("Implementation Partner", pBrandName) : ""}
  ${billing ? `
  <h3 style="margin:16px 0 8px;font-size:12px;color:#555">Datos de facturación</h3>
  <table>
    ${orgRow("Email facturación", billing.billing_email)}
    ${orgRow("NIF / VAT facturación", billing.vat_id)}
    ${orgRow("Dirección facturación", billingAddress)}
  </table>` : '<p style="color:#b8860b;font-style:italic;font-size:11px;margin-top:12px">Datos de facturación no informados.</p>'}
</div>

<h2>2. Inventario de Sistemas IA (Cláusula 8)</h2>
<table><tr><th>ID</th><th>Sistema</th><th>Responsable</th><th>Departamento</th><th>Criticidad</th><th>Estado</th></tr>
${useCases.map((u: any) => `<tr><td>${esc(u.code)}</td><td>${esc(u.name)}</td><td>${esc(u.owner_name)}</td><td>${esc(u.department)}</td><td>${esc(u.criticality)}</td><td>${esc(u.status)}</td></tr>`).join("")}
${useCases.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#888">Sin sistemas registrados</td></tr>' : ""}
</table>

<h2>3. Registro de Riesgos IA (Cláusula 6.1)</h2>
<table><tr><th>ID</th><th>Riesgo</th><th>Categoría</th><th>I×P</th><th>Score</th><th>Cláusula</th><th>Estado</th></tr>
${risks.map((r: any) => `<tr><td>${esc(r.code)}</td><td>${esc(r.name)}</td><td>${esc(r.category)}</td><td>${r.impact}×${r.probability}</td><td>${r.score ?? ""}</td><td>${esc(r.iso_clause)}</td><td>${esc(r.status)}</td></tr>`).join("")}
${risks.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:#888">Sin riesgos registrados</td></tr>' : ""}
</table>

<h2>4. Registro de Controles (Cláusula 6.1.3)</h2>
<table><tr><th>Control</th><th>Responsable</th><th>Cláusula</th><th>Anexo</th><th>Estado</th></tr>
${controls.map((c: any) => `<tr><td>${esc(c.name)}</td><td>${esc(c.owner_name)}</td><td>${esc(c.iso_clause)}</td><td>${esc(c.annex_control)}</td><td>${esc(c.status)}</td></tr>`).join("")}
${controls.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#888">Sin controles definidos</td></tr>' : ""}
</table>

<h2>5. Matriz Requisito → Evidencia</h2>
<table><tr><th>Req ID</th><th>Requisito</th><th>Cláusula</th><th>Responsable</th><th>Estado</th><th>Fecha objetivo</th></tr>
${reqMap.map((r: any) => `<tr><td>${esc(r.requirement_id)}</td><td>${esc(r.requirement_name)}</td><td>${esc(r.iso_clause)}</td><td>${esc(r.owner_name)}</td><td><span class="badge ${r.status}">${esc(r.status)}</span></td><td>${r.target_date ? formatDateES(r.target_date) : ""}</td></tr>`).join("")}
${reqMap.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#888">Sin requisitos mapeados</td></tr>' : ""}
</table>

<h2>6. Biblioteca de Evidencias (Cláusula 7.5)</h2>
<table><tr><th>Documento</th><th>Categoría</th><th>Cláusula</th><th>Responsable</th><th>Versión</th><th>Estado</th></tr>
${evidences.map((e: any) => `<tr><td>${esc(e.name)}</td><td>${esc(e.category)}</td><td>${esc(e.iso_clause)}</td><td>${esc(e.owner_name)}</td><td>${esc(e.version)}</td><td>${esc(e.status)}</td></tr>`).join("")}
${evidences.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#888">Sin evidencias subidas</td></tr>' : ""}
</table>

<h2>7. Roles de Gobernanza (Cláusula 5.3)</h2>
<table><tr><th>Rol</th><th>Descripción</th><th>Miembros</th></tr>
${roles.map((r: any) => `<tr><td>${esc(r.name)}</td><td>${esc(r.description)}</td><td>${r.member_count ?? 0}</td></tr>`).join("")}
${roles.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#888">Sin roles definidos</td></tr>' : ""}
</table>

<h2>8. Gaps y Acciones Pendientes</h2>
<table><tr><th>Requisito</th><th>Cláusula</th><th>Responsable</th><th>Fecha objetivo</th><th>Notas</th></tr>
${reqMap.filter((r: any) => r.status === "gap").map((r: any) => `<tr><td>${esc(r.requirement_name)}</td><td>${esc(r.iso_clause)}</td><td>${esc(r.owner_name)}</td><td>${r.target_date ? formatDateES(r.target_date) : ""}</td><td>${esc(r.notes)}</td></tr>`).join("")}
${reqMap.filter((r: any) => r.status === "gap").length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#888">Sin gaps identificados</td></tr>' : ""}
</table>

<h2>9. Registro de Auditoría (Reciente)</h2>
<table><tr><th>Fecha</th><th>Acción</th><th>Entidad</th></tr>
${auditLog.slice(0, 20).map((a: any) => `<tr><td>${formatDateES(a.created_at)}</td><td>${esc(a.action)}</td><td>${esc(a.entity_type)}</td></tr>`).join("")}
</table>

<div class="footer">
<p>Generado por AIMS Evidence Pack Hub · ISO/IEC 42001:2023 · ${formatDateES(generatedAt)}</p>
<p>Este documento es auto-generado. Verifique toda la información antes de presentarlo a auditores.</p>
${pFooterText ? `<p style="color:${esc(pColor)};font-weight:600">${esc(pFooterText)}</p>` : ""}
</div>
</div>
</div>
</body></html>`;

    // Store files based on requested formats
    let htmlSignedUrl: string | null = null;
    let csvSignedUrl: string | null = null;

    if (formats.includes("pdf")) {
      const htmlBlob = new TextEncoder().encode(htmlContent);
      const fileName = `exports/${orgId}/${export_id}/evidence-pack.html`;
      await admin.storage.from("evidence-files").upload(fileName, htmlBlob, { contentType: "text/html", upsert: true });
      const { data: htmlUrl } = await admin.storage.from("evidence-files").createSignedUrl(fileName, 86400);
      htmlSignedUrl = htmlUrl?.signedUrl ?? null;

      // Update file size in export record
      await admin.from("report_exports").update({ file_size: htmlBlob.byteLength }).eq("id", export_id);
    }

    if (formats.includes("zip")) {
      const csvBlob = new TextEncoder().encode(indexCsv);
      await admin.storage.from("evidence-files").upload(`exports/${orgId}/${export_id}/index.csv`, csvBlob, { contentType: "text/csv", upsert: true });
      const { data: csvUrl } = await admin.storage.from("evidence-files").createSignedUrl(`exports/${orgId}/${export_id}/index.csv`, 86400);
      csvSignedUrl = csvUrl?.signedUrl ?? null;
    }

    const manifestBlob = new TextEncoder().encode(JSON.stringify(manifest, null, 2));
    await admin.storage.from("evidence-files").upload(`exports/${orgId}/${export_id}/manifest.json`, manifestBlob, { contentType: "application/json", upsert: true });

    // Update export record
    await admin.from("report_exports").update({
      status: "ready",
      completed_at: new Date().toISOString(),
      file_url: htmlSignedUrl || csvSignedUrl,
      manifest,
    }).eq("id", export_id);

    // Increment usage meter
    const { data: meter } = await admin
      .from("usage_meters")
      .select("id, exports_count")
      .eq("tenant_id", orgId)
      .eq("tenant_type", "org")
      .order("period_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (meter) {
      await admin.from("usage_meters").update({ exports_count: (meter.exports_count ?? 0) + 1 }).eq("id", meter.id);
    }

    // Audit log
    await admin.from("audit_log").insert({
      organization_id: orgId,
      user_id: userId,
      action: "export_generated",
      entity_type: "report_export",
      entity_id: export_id,
      details: { format: exportRecord.format, sections: manifest.counts, version: manifest.version },
    });

    return new Response(JSON.stringify({
      status: "ready",
      html_url: htmlSignedUrl,
      csv_url: csvSignedUrl,
      manifest,
      formats,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    try {
      const { export_id } = await req.clone().json().catch(() => ({}));
      if (export_id) {
        const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        await admin.from("report_exports").update({ status: "failed", error_message: String(err) }).eq("id", export_id);
      }
    } catch {}

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
