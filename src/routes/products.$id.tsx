import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { Star, Minus, Plus, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const { data: p, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Product & { description: string };
    },
  });

  if (isLoading) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  if (error || !p) return <div className="container mx-auto px-4 py-20 text-center">Product not found.</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-muted shadow-card">
          {p.image && <img src={p.image} alt={p.name} className="w-full object-cover" />}
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{p.brand} · {p.category}</p>
          <h1 className="mt-2 font-display text-4xl font-bold">{p.name}</h1>
          <div className="mt-2 flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-warning text-warning" /> {Number(p.rating).toFixed(1)}
          </div>
          <p className="mt-6 font-display text-3xl font-bold">{money(p.price)}</p>
          <p className="mt-6 text-muted-foreground">{p.description}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center hover:bg-muted">
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="grid h-10 w-10 place-items-center hover:bg-muted">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" disabled={p.stock <= 0} onClick={() => add(p.id, qty)}>Add to cart</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
