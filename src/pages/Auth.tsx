import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, ArrowLeft } from "lucide-react";

type AuthView = "login" | "signup" | "forgot";

export default function Auth() {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Error al iniciar sesión", description: error.message, variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error al registrarse", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cuenta creada", description: "Revisa tu correo para confirmar o inicia sesión directamente." });
      setView("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada para restablecer tu contraseña." });
      setView("login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-accent-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">GovAI Hub</h1>
          <p className="text-sm text-muted-foreground">Plataforma de gobernanza de IA · ISO 42001</p>
        </div>

        {view === "login" && (
          <Card>
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle className="text-lg">Iniciar sesión</CardTitle>
                <CardDescription>Accede a tu cuenta con email y contraseña</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Iniciar sesión
                </Button>
                <div className="flex items-center justify-between w-full text-sm">
                  <button type="button" className="text-accent hover:underline" onClick={() => setView("forgot")}>
                    ¿Olvidaste tu contraseña?
                  </button>
                  <button type="button" className="text-accent hover:underline" onClick={() => setView("signup")}>
                    Crear cuenta
                  </button>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}

        {view === "signup" && (
          <Card>
            <form onSubmit={handleSignup}>
              <CardHeader>
                <CardTitle className="text-lg">Crear cuenta</CardTitle>
                <CardDescription>Regístrate para empezar con tu organización</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input id="fullName" type="text" placeholder="María García" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input id="signupEmail" type="email" placeholder="tu@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Contraseña</Label>
                  <Input id="signupPassword" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear cuenta
                </Button>
                <button type="button" className="flex items-center gap-1 text-sm text-accent hover:underline" onClick={() => setView("login")}>
                  <ArrowLeft className="h-3 w-3" /> Volver al login
                </button>
              </CardFooter>
            </form>
          </Card>
        )}

        {view === "forgot" && (
          <Card>
            <form onSubmit={handleForgotPassword}>
              <CardHeader>
                <CardTitle className="text-lg">Recuperar contraseña</CardTitle>
                <CardDescription>Te enviaremos un enlace para restablecerla</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input id="resetEmail" type="email" placeholder="tu@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar enlace
                </Button>
                <button type="button" className="flex items-center gap-1 text-sm text-accent hover:underline" onClick={() => setView("login")}>
                  <ArrowLeft className="h-3 w-3" /> Volver al login
                </button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
