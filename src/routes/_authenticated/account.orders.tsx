import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { money, dateShort } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/account/orders")({
  component: Orders,
});

function statusVariant(s: string) {
  return s === "Delivered" ? "default" : s === "Cancelled" ? "destructive" : "secondary";
}

function Orders() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total_amount, order_status, payment_status, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h1 className="font-display text-2xl font-bold">Orders</h1>
      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Loading…</p>
      ) : !data?.length ? (
        <p className="mt-6 text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y">
          {data.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-4">
              <div>
                <Link to="/account/orders/$id" params={{ id: o.id }} className="font-medium hover:text-primary">
                  Order #{o.id.slice(0, 8)}
                </Link>
                <p className="text-xs text-muted-foreground">{dateShort(o.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant(o.order_status) as never}>{o.order_status}</Badge>
                <span className="w-24 text-right font-semibold">{money(o.total_amount)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
