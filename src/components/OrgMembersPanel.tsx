import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Loader2, Mail, Briefcase, Trash2 } from "lucide-react";
import { useOrgMembers, useCreateOrgMember, useDeleteOrgMember } from "@/hooks/useOrgMembers";
import { toast } from "sonner";

export function OrgMembersPanel() {
  const { data: members = [], isLoading } = useOrgMembers();
  const createMember = useCreateOrgMember();
  const deleteMember = useDeleteOrgMember();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const handleCreate = () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error("Nombre y email son obligatorios");
      return;
    }
    createMember.mutate(
      { full_name: fullName.trim(), email: email.trim(), job_title: jobTitle.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Miembro añadido");
          setFullName(""); setEmail(""); setJobTitle("");
          setOpen(false);
        },
        onError: (e) => toast.error("Error: " + e.message),
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name}?`)) return;
    deleteMember.mutate(id, {
      onSuccess: () => toast.success("Miembro eliminado"),
      onError: (e) => toast.error("Error: " + e.message),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Miembros de la organización</CardTitle>
          <CardDescription>Personas que pueden ser asignadas como responsables de roles</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <UserPlus className="h-3.5 w-3.5" /> Añadir miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo miembro</DialogTitle>
              <DialogDescription>Registra una persona de tu organización para asignarle roles de gobernanza.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="member-name">Nombre completo *</Label>
                <Input id="member-name" placeholder="Ej: María García" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">Email *</Label>
                <Input id="member-email" type="email" placeholder="maria@empresa.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-title">Cargo</Label>
                <Input id="member-title" placeholder="Ej: CTO, DPO, CISO..." value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createMember.isPending || !fullName.trim() || !email.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createMember.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Añadir miembro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>
        ) : members.length === 0 ? (
          <div className="text-center py-6">
            <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay miembros registrados</p>
            <p className="text-xs text-muted-foreground mt-1">Añade miembros para poder asignarles roles de gobernanza</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold">
                    {m.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.full_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>
                      {m.job_title && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{m.job_title}</span>}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(m.id, m.full_name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
