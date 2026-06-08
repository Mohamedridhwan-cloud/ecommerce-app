import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { money, dateShort } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account/orders/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
      return { order, items: items ?? [] };
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (!data?.order) return <div>Order not found.</div>;

  const o = data.order;
  const addr = o.shipping_address as Record<string, string>;
  const stages = ["Pending", "Processing", "Shipped", "Delivered"] as const;
  const currentIdx = stages.indexOf(o.order_status as typeof stages[number]);

  return (
    <div className="space-y-6">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Order #{o.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">Placed {dateShort(o.created_at)}</p>
          </div>
          <Badge>{o.order_status}</Badge>
        </div>

        {o.order_status !== "Cancelled" && (
          <div className="mt-6 flex items-center justify-between">
            {stages.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center">
                <div className={`grid h-8 w-8 place-items-center rounded-full ${i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className={`mt-2 text-xs ${i <= currentIdx ? "font-medium" : "text-muted-foreground"}`}>{s}</p>
                {i < stages.length - 1 && <div className={`absolute h-px w-[calc(100%/4)] -translate-y-4 translate-x-[50%] ${i < currentIdx ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">Items</h3>
            <ul className="mt-3 space-y-3">
              {data.items.map((i) => (
                <li key={i.id} className="flex gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-lg bg-muted">
                    {i.product_image && <img src={i.product_image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{i.product_name}</p>
                    <p className="text-xs text-muted-foreground">{i.quantity} × {money(i.price)}</p>
                  </div>
                  <p className="text-sm font-semibold">{money(Number(i.price) * i.quantity)}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Shipping to</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {addr.full_name}<br />
              {addr.street}<br />
              {addr.city}, {addr.state} {addr.postal_code}<br />
              {addr.country}
            </p>
            <div className="mt-6 space-y-1 text-sm">
              <div className="flex justify-between"><span>Payment</span><span>{o.payment_status}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>{money(o.total_amount)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
