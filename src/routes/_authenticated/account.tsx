import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { User, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  component: AccountLayout,
});

function AccountLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav: Array<{ to: "/account" | "/account/orders"; label: string; icon: typeof User; exact?: boolean }> = [
    { to: "/account", label: "Profile", icon: User, exact: true },
    { to: "/account/orders", label: "Orders", icon: Package },
  ];

  return (
    <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[220px_1fr]">
      <aside>
        <h2 className="font-display text-lg font-semibold">My account</h2>
        <nav className="mt-4 flex flex-col gap-1">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
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
