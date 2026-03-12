import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Globe, Clock } from "lucide-react";

const TIMEZONES = [
  "Europe/Madrid", "Europe/London", "Europe/Berlin", "Europe/Paris",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Mexico_City", "America/Bogota", "America/Santiago", "America/Buenos_Aires",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore", "Pacific/Auckland",
];

export default function Account() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    job_title: "",
    locale: "es",
    timezone: "Europe/Madrid",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, job_title, locale, timezone")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            display_name: data.display_name || "",
            job_title: (data as any).job_title || "",
            locale: (data as any).locale || "es",
            timezone: (data as any).timezone || "Europe/Madrid",
          });
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name.trim() || null,
        job_title: form.job_title.trim() || null,
        locale: form.locale,
        timezone: form.timezone,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil actualizado" });
      await refreshProfile();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <PageHeader
        title="Mi cuenta"
        subtitle="Gestiona tu perfil personal."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-accent" /> Datos personales
          </CardTitle>
          <CardDescription>Información visible para tu equipo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> Email
            </Label>
            <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
            <p className="text-[11px] text-muted-foreground">El email no se puede cambiar.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Nombre completo</Label>
            <Input
              id="display_name"
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              placeholder="Nombre y apellido"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Cargo (opcional)</Label>
            <Input
              id="job_title"
              value={form.job_title}
              onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
              placeholder="Ej: CISO, Data Protection Officer"
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3 w-3" /> Idioma
              </Label>
              <Select value={form.locale} onValueChange={(v) => setForm((f) => ({ ...f, locale: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Zona horaria
              </Label>
              <Select value={form.timezone} onValueChange={(v) => setForm((f) => ({ ...f, timezone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
