import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, ArrowRight, BarChart3, FileText, Users } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Dashboard de gobernanza", desc: "Visión completa del estado de madurez y cumplimiento ISO 42001 de tu organización." },
  { icon: FileText, title: "Gestión de evidencias", desc: "Centraliza documentos, controles y evidencias con ciclos de revisión automatizados." },
  { icon: Shield, title: "Registro de riesgos IA", desc: "Identifica, evalúa y gestiona los riesgos asociados a tus sistemas de inteligencia artificial." },
  { icon: Users, title: "Roles y comités", desc: "Define la estructura de gobernanza con roles, responsabilidades y comités." },
];

const checks = [
  "Inventario de sistemas IA",
  "Evaluación de riesgos",
  "Control de evidencias",
  "Informes de auditoría",
  "Roles ISO 42001",
  "Panel multitenant",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
            <Shield className="h-4 w-4" />
            Plataforma ISO 42001
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Gobernanza de IA
            <span className="block text-accent">simplificada</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            GovAI Hub te ayuda a cumplir con ISO 42001 gestionando riesgos, evidencias, controles y roles desde una única plataforma.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">
                Empezar gratis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">Ver planes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">Todo lo que necesitas para la gobernanza de IA</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Una plataforma integral diseñada para organizaciones que adoptan inteligencia artificial de forma responsable.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Checklist */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">¿Qué cubre GovAI Hub?</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {checks.map((c) => (
              <div key={c} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm font-medium text-foreground">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Empieza a gobernar tu IA hoy</h2>
        <p className="mt-3 text-muted-foreground">Crea tu cuenta gratuita y configura tu organización en minutos.</p>
        <Button asChild size="lg" className="mt-8 gap-2">
          <Link to="/auth">
            Crear cuenta <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-5xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">© 2026 GovAI Hub. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground">Precios</Link>
            <Link to="/faq" className="hover:text-foreground">FAQ</Link>
            <Link to="/contact" className="hover:text-foreground">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
