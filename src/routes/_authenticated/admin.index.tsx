import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import { Users, Package, ShoppingBag, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersC, productsC, ordersAll] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total_amount, created_at, order_status").order("created_at", { ascending: false }),
      ]);
      const orders = ordersAll.data ?? [];
      const revenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);

      // last 7 days revenue
      const byDay: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = d.toISOString().slice(5, 10);
        byDay[k] = 0;
      }
      for (const o of orders) {
        const k = new Date(o.created_at).toISOString().slice(5, 10);
        if (k in byDay) byDay[k] += Number(o.total_amount);
      }
      const chart = Object.entries(byDay).map(([day, total]) => ({ day, total }));

      return {
        users: usersC.count ?? 0,
        products: productsC.count ?? 0,
        ordersCount: orders.length,
        revenue,
        chart,
      };
    },
  });

  const stats = [
    { label: "Total users", value: data?.users ?? 0, icon: Users },
    { label: "Total products", value: data?.products ?? 0, icon: Package },
    { label: "Total orders", value: data?.ordersCount ?? 0, icon: ShoppingBag },
    { label: "Revenue", value: money(data?.revenue ?? 0), icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Revenue · last 7 days</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.chart ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
