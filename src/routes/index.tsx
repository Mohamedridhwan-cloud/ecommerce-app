import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getFeaturedProducts, type Product } from "@/lib/products.functions";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";

const featuredQueryOptions = queryOptions({
  queryKey: ["featured-products"],
  queryFn: () => getFeaturedProducts(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Azura — Considered goods for everyday wonder" },
      { name: "description", content: "Curated electronics, apparel, home goods and accessories — designed for everyday wonder." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(featuredQueryOptions);
  },
  component: Home,
  errorComponent: ({ error }) => (
    <div role="alert" className="container mx-auto px-4 py-20 text-center text-destructive">
      Failed to load products: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
      No products found.
    </div>
  ),
});

function Home() {
  const { data: featured } = useSuspenseQuery(featuredQueryOptions);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-gradient opacity-90" />
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />
        <div className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-2 md:py-32">
          <div className="flex flex-col justify-center text-primary-foreground">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> New season, new finds
            </span>
            <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
              Beautiful things,<br />carefully chosen.
            </h1>
            <p className="mt-5 max-w-md text-base text-primary-foreground/85">
              From studio-grade headphones to hand-glazed mugs — explore a small catalog of objects worth keeping.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/products">Shop the collection <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-primary-foreground hover:bg-white/20">
                <Link to="/about">Our story</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
              {featured.slice(0, 4).map((p: Product, i: number) => (
                <div key={p.id} className={`overflow-hidden rounded-2xl shadow-glow ${i % 2 ? "translate-y-8" : ""}`}>
                  {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="container mx-auto grid gap-6 px-4 py-12 md:grid-cols-3">
        {[
          { icon: Truck, title: "Free shipping over $50", text: "Fast, tracked delivery on every order." },
          { icon: ShieldCheck, title: "Secure checkout", text: "Your data is encrypted end-to-end." },
          { icon: Sparkles, title: "Curated by us", text: "Every product is hand-picked." },
        ].map((f) => (
          <div key={f.title} className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-card">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Top rated</h2>
            <p className="text-muted-foreground">Crowd favorites this week.</p>
          </div>
          <Button asChild variant="ghost"><Link to="/products">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p: Product) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </div>
  );
}
