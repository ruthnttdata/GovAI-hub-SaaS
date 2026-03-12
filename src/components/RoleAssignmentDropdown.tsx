import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrgMembers, useRoleAssignments, useAssignRole } from "@/hooks/useOrgMembers";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
  roleId: string;
  roleName: string;
}

export function RoleAssignmentDropdown({ roleId, roleName }: Props) {
  const { data: members = [] } = useOrgMembers();
  const { data: assignments = [] } = useRoleAssignments();
  const assignRole = useAssignRole();

  const currentAssignment = assignments.find((a) => a.role_id === roleId);
  const assignedMember = currentAssignment?.org_members as { id: string; full_name: string; email: string } | null;

  const handleAssign = (memberId: string) => {
    assignRole.mutate(
      { role_id: roleId, member_id: memberId },
      {
        onSuccess: () => toast.success(`Responsable asignado a ${roleName}`),
        onError: (e) => toast.error("Error: " + e.message),
      }
    );
  };

  return (
    <div className="mt-2 space-y-1">
      <Select value={assignedMember?.id ?? ""} onValueChange={handleAssign} disabled={assignRole.isPending}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Asignar responsable..." />
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.full_name} ({m.email})
            </SelectItem>
          ))}
          {members.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">No hay miembros registrados</div>
          )}
        </SelectContent>
      </Select>
      {assignedMember && (
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">{assignedMember.full_name}</Badge>
          <span className="text-[10px] text-muted-foreground">{assignedMember.email}</span>
        </div>
      )}
    </div>
  );
}
