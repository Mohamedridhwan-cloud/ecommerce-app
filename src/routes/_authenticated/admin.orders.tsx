import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { money, dateShort } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, order_status, payment_status, created_at, user_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (id: string, status: typeof STATUSES[number]) => {
    const { error } = await supabase.from("orders").update({ order_status: status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">#{o.id.slice(0, 8)}</TableCell>
                <TableCell>{dateShort(o.created_at)}</TableCell>
                <TableCell>{money(o.total_amount)}</TableCell>
                <TableCell>{o.payment_status}</TableCell>
                <TableCell>
                  <Select value={o.order_status} onValueChange={(v) => updateStatus(o.id, v as typeof STATUSES[number])}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
