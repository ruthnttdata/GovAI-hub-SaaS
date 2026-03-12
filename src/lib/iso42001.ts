// ISO/IEC 42001 clause structure for Evidence Pack
export const ISO_42001_CLAUSES = [
  {
    clause: "4",
    title: "Context of the Organization",
    subclauses: [
      { id: "4.1", name: "Understanding the organization and its context", evidenceType: "AIMS Scope Document" },
      { id: "4.2", name: "Understanding the needs of interested parties", evidenceType: "Stakeholder Register" },
      { id: "4.3", name: "Determining the scope of the AIMS", evidenceType: "AIMS Scope Statement" },
      { id: "4.4", name: "AI Management System", evidenceType: "AIMS Documentation" },
    ],
  },
  {
    clause: "5",
    title: "Leadership",
    subclauses: [
      { id: "5.1", name: "Leadership and commitment", evidenceType: "Management Commitment Letter" },
      { id: "5.2", name: "AI Policy", evidenceType: "AI Policy Document" },
      { id: "5.3", name: "Organizational roles, responsibilities and authorities", evidenceType: "RACI Matrix / Org Chart" },
    ],
  },
  {
    clause: "6",
    title: "Planning",
    subclauses: [
      { id: "6.1", name: "Actions to address risks and opportunities", evidenceType: "Risk Register" },
      { id: "6.1.2", name: "AI risk assessment", evidenceType: "AI Risk Assessment Report" },
      { id: "6.1.3", name: "AI risk treatment", evidenceType: "Risk Treatment Plan" },
      { id: "6.2", name: "AI objectives and planning to achieve them", evidenceType: "AI Objectives Document" },
    ],
  },
  {
    clause: "7",
    title: "Support",
    subclauses: [
      { id: "7.1", name: "Resources", evidenceType: "Resource Allocation Plan" },
      { id: "7.2", name: "Competence", evidenceType: "Training Records" },
      { id: "7.3", name: "Awareness", evidenceType: "Awareness Program Records" },
      { id: "7.4", name: "Communication", evidenceType: "Communication Plan" },
      { id: "7.5", name: "Documented information", evidenceType: "Document Control Procedure" },
    ],
  },
  {
    clause: "8",
    title: "Operation",
    subclauses: [
      { id: "8.1", name: "Operational planning and control", evidenceType: "Operational Procedures" },
      { id: "8.2", name: "AI risk assessment (operational)", evidenceType: "Operational Risk Assessment" },
      { id: "8.3", name: "AI risk treatment (operational)", evidenceType: "Treatment Implementation Records" },
      { id: "8.4", name: "AI system impact assessment", evidenceType: "Impact Assessment Report" },
    ],
  },
  {
    clause: "9",
    title: "Performance Evaluation",
    subclauses: [
      { id: "9.1", name: "Monitoring, measurement, analysis and evaluation", evidenceType: "KPI Reports" },
      { id: "9.2", name: "Internal audit", evidenceType: "Internal Audit Report" },
      { id: "9.3", name: "Management review", evidenceType: "Management Review Minutes" },
    ],
  },
  {
    clause: "10",
    title: "Improvement",
    subclauses: [
      { id: "10.1", name: "Continual improvement", evidenceType: "Improvement Plan" },
      { id: "10.2", name: "Nonconformity and corrective action", evidenceType: "Corrective Action Records" },
    ],
  },
];

export const ANNEX_A_CONTROLS = [
  { id: "A.2", name: "AI Policies", description: "Establishment of AI policies aligned with organizational objectives" },
  { id: "A.3", name: "Internal Organization", description: "Roles, responsibilities and authorities for AI management" },
  { id: "A.4", name: "Resources for AI Systems", description: "Data, tools, systems and computing resources" },
  { id: "A.5", name: "Assessing Impacts of AI Systems", description: "Impact assessment on individuals, groups and societies" },
  { id: "A.6", name: "AI System Life Cycle", description: "Management throughout the AI system life cycle" },
  { id: "A.7", name: "Data for AI Systems", description: "Data quality, provenance and preparation" },
  { id: "A.8", name: "Information for Interested Parties", description: "Transparency and communication about AI systems" },
  { id: "A.9", name: "Use of AI Systems", description: "Responsible use and human oversight" },
  { id: "A.10", name: "Third-Party Relationships", description: "Managing suppliers and third-party AI components" },
];

export const VERTICAL_TEMPLATES = [
  { id: "general", name: "General / Multi-sector", description: "Plantilla genérica para cualquier organización" },
  { id: "financial", name: "Servicios Financieros", description: "Incluye controles de sesgo en scoring, AML y compliance financiero" },
  { id: "healthcare", name: "Salud / Healthcare", description: "Incluye controles de datos sanitarios, HIPAA y pacientes" },
  { id: "legal", name: "Legal / Professional Services", description: "Incluye controles de confidencialidad, privilegio legal y responsabilidad" },
  { id: "manufacturing", name: "Manufactura / Industria", description: "Incluye controles de seguridad operacional y cadena de suministro" },
  { id: "public_sector", name: "Sector Público", description: "Incluye controles de transparencia, equidad y acceso" },
  { id: "technology", name: "Tecnología / SaaS", description: "Incluye controles de desarrollo responsable y MLOps" },
];

export const NEUTRAL_AI_USE_CASES = [
  { name: "Customer Support Assistant", category: "Atención al cliente", description: "Chatbot IA para resolución de consultas" },
  { name: "Document Processing & Classification", category: "Operaciones", description: "Procesamiento automático de documentos entrantes" },
  { name: "Internal Knowledge Assistant", category: "Productividad", description: "Asistente interno para búsqueda en base de conocimiento" },
  { name: "Fraud Screening (light)", category: "Riesgo", description: "Screening básico de transacciones sospechosas" },
  { name: "HR Resume Screening", category: "RRHH", description: "Pre-filtrado de candidatos con IA" },
  { name: "Predictive Maintenance", category: "Operaciones", description: "Predicción de fallos en equipos o sistemas" },
  { name: "Content Generation", category: "Marketing", description: "Generación de contenido para comunicaciones" },
  { name: "Data Analytics & Reporting", category: "Analítica", description: "Análisis automatizado y generación de informes" },
];

// Evidence Pack PDF Index
export const EVIDENCE_PACK_INDEX = [
  { section: 1, title: "Portada y Datos de la Organización", source: "organizations" },
  { section: 2, title: "Alcance del AIMS (Cláusula 4)", source: "organizations.aims_scope" },
  { section: 3, title: "Inventario de Sistemas de IA", source: "ai_use_cases" },
  { section: 4, title: "Política de IA (Cláusula 5.2)", source: "evidences[category=Políticas]" },
  { section: 5, title: "Roles y Estructura de Gobernanza (Cláusula 5.3)", source: "governance_roles + raci" },
  { section: 6, title: "Registro de Riesgos IA (Cláusula 6.1)", source: "risks" },
  { section: 7, title: "Plan de Tratamiento de Riesgos (Cláusula 6.1.3)", source: "controls" },
  { section: 8, title: "Matriz Requisito → Control → Evidencia", source: "requirement_evidence_map" },
  { section: 9, title: "Controles Annex A Aplicables", source: "annex_a mapping" },
  { section: 10, title: "Evidencias Adjuntas (Cláusula 7.5)", source: "evidences" },
  { section: 11, title: "Plan de Acción y Gaps Abiertos", source: "requirement_evidence_map[status=gap]" },
  { section: 12, title: "Registro de Auditoría (Audit Trail)", source: "audit_log" },
  { section: 13, title: "Índice de Evidencias (index.csv)", source: "generated" },
];
