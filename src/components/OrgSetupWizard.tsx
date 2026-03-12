import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Building2, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VERTICAL_TEMPLATES } from "@/lib/iso42001";

interface Props {
  onComplete: () => void;
}

const sectors = ["Tecnología", "Finanzas", "Salud", "Legal", "Retail", "Manufactura", "Consultoría", "Sector Público", "Energía", "Educación", "Otro"];
const countries = ["España", "México", "Argentina", "Colombia", "Chile", "Estados Unidos", "Reino Unido", "Alemania", "Francia", "Otro"];

export default function OrgSetupWizard({ onComplete }: Props) {
  const [orgName, setOrgName] = useState("");
  const [sector, setSector] = useState("");
  const [country, setCountry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [verticalTemplate, setVerticalTemplate] = useState("general");
  const [aimsScope, setAimsScope] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("setup_organization", {
        _org_name: orgName.trim(),
        _sector: sector || null,
        _country: country || null,
        _employee_count: employeeCount ? parseInt(employeeCount) : null,
        _vertical_template: verticalTemplate,
        _aims_scope: aimsScope || null,
      });
      if (error) throw error;
      toast({ title: "¡Organización creada!", description: "Tu AIMS está listo para configurar." });
      onComplete();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">ISO 42001 Evidence Pack Hub</h1>
          <p className="text-sm text-muted-foreground text-center">
            Configura tu organización y el alcance de tu AI Management System (AIMS)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent" />
              Configuración del AIMS
            </CardTitle>
            <CardDescription>
              Estos datos alimentarán las cláusulas 4.1–4.3 de tu Evidence Pack
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nombre de la organización *</label>
                <Input placeholder="Ej: Acme Corp" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Sector</label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>{sectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">País</label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                    <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nº de empleados</label>
                <Input type="number" placeholder="150" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} />
              </div>

              {/* Vertical Template */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plantilla de vertical</label>
                <Select value={verticalTemplate} onValueChange={setVerticalTemplate}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VERTICAL_TEMPLATES.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <div>
                          <p className="font-medium">{v.name}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {VERTICAL_TEMPLATES.find(v => v.id === verticalTemplate)?.description}
                </p>
              </div>

              {/* AIMS Scope */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Alcance del AIMS (Cláusula 4.3)</label>
                <Input
                  placeholder="Ej: Todos los sistemas de IA usados en operaciones y atención al cliente"
                  value={aimsScope}
                  onChange={(e) => setAimsScope(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Define qué sistemas, procesos y áreas cubre tu AIMS</p>
              </div>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2" disabled={loading || !orgName.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Crear AIMS y comenzar <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
          <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Se te asignará rol <strong>Admin</strong>. El sistema pre-cargará la estructura ISO 42001 con plantillas de riesgos y controles para tu vertical.
          </p>
        </div>
      </div>
    </div>
  );
}
