import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { dateShort } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const rolesByUser = new Map<string, string[]>();
      roles?.forEach((r) => {
        const arr = rolesByUser.get(r.user_id) ?? [];
        arr.push(r.role);
        rolesByUser.set(r.user_id, arr);
      });
      return profiles?.map((p) => ({ ...p, roles: rolesByUser.get(p.id) ?? ["user"] })) ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Users</h1>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Roles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{dateShort(u.created_at)}</TableCell>
                <TableCell className="space-x-1">
                  {u.roles.map((r) => (
                    <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>{r}</Badge>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
