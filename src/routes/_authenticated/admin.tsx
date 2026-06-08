import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, ShoppingBag, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!roles?.some((r) => r.role === "admin")) throw redirect({ to: "/" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav: Array<{ to: "/admin" | "/admin/products" | "/admin/orders" | "/admin/users"; label: string; icon: typeof Users; exact?: boolean }> = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { to: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[220px_1fr]">
      <aside>
        <h2 className="font-display text-lg font-semibold">Admin</h2>
        <nav className="mt-4 flex flex-col gap-1">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section><Outlet /></section>
    </div>
  );
}
