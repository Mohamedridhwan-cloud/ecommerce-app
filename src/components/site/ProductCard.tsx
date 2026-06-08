import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  image: string | null;
  brand: string | null;
  rating: number | string;
  stock: number;
};

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  return (
    <div className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow">
      <Link to="/products/$id" params={{ id: p.id }} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          {p.image && (
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{p.brand}</span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" />
            {Number(p.rating).toFixed(1)}
          </span>
        </div>
        <Link to="/products/$id" params={{ id: p.id }}>
          <h3 className="mt-1 line-clamp-1 font-medium hover:text-primary">{p.name}</h3>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-lg font-bold">{money(p.price)}</p>
          <Button size="sm" onClick={() => add(p.id)} disabled={p.stock <= 0}>
            {p.stock <= 0 ? "Sold out" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
