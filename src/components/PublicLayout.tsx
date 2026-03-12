import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Precios", to: "/pricing" },
  { label: "FAQ", to: "/faq" },
  { label: "Partners", to: "/partners" },
  { label: "Contacto", to: "/contact" },
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Shield className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">IA Gov Evidence Hub</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm transition-colors hover:text-accent ${
                  location.pathname === item.to ? "text-accent font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
              <Link to="/auth">Probar gratis 14 días</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-card px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block text-sm text-muted-foreground hover:text-accent"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Iniciar sesión</Link>
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground" asChild>
                <Link to="/auth">Probar gratis 14 días</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <span className="text-sm font-bold">IA Gov Evidence Hub</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plataforma SaaS para gobierno continuo de IA, alineada con ISO/IEC 42001.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Producto</h4>
              <div className="space-y-2">
                <Link to="/pricing" className="block text-xs text-muted-foreground hover:text-accent">Precios</Link>
                <Link to="/faq" className="block text-xs text-muted-foreground hover:text-accent">FAQ</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Empresa</h4>
              <div className="space-y-2">
                <Link to="/partners" className="block text-xs text-muted-foreground hover:text-accent">Partners</Link>
                <Link to="/contact" className="block text-xs text-muted-foreground hover:text-accent">Contacto</Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Legal</h4>
              <div className="space-y-2">
                <span className="block text-xs text-muted-foreground">Seguridad y privacidad</span>
                <span className="block text-xs text-muted-foreground">Términos</span>
                <span className="block text-xs text-muted-foreground">Política de privacidad</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} IA Gov Evidence Hub. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
              ISO/IEC 42001 aligned — esta herramienta no certifica ni garantiza conformidad. La certificación depende de tu auditoría y del organismo certificador.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
