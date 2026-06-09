import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getProducts, type Product } from "@/lib/products.functions";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating"]).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
});

const PAGE_SIZE = 8;

const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => getProducts(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — Azura" },
      { name: "description", content: "Browse the full Azura catalog. Search, filter, and sort across all categories." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQueryOptions);
  },
  component: ProductsPage,
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

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [qLocal, setQLocal] = useState(search.q ?? "");

  const { data: products } = useSuspenseQuery(productsQueryOptions);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p: Product) => p.category))),
    [products],
  );

  const filtered = useMemo(() => {
    let list = products;
    if (search.q) {
      const t = search.q.toLowerCase();
      list = list.filter((p: Product) => p.name.toLowerCase().includes(t) || (p.brand ?? "").toLowerCase().includes(t));
    }
    if (search.category) list = list.filter((p: Product) => p.category === search.category);
    if (search.min != null) list = list.filter((p: Product) => Number(p.price) >= search.min!);
    if (search.max != null) list = list.filter((p: Product) => Number(p.price) <= search.max!);
    switch (search.sort) {
      case "price_asc": list = [...list].sort((a: Product, b: Product) => Number(a.price) - Number(b.price)); break;
      case "price_desc": list = [...list].sort((a: Product, b: Product) => Number(b.price) - Number(a.price)); break;
      case "rating": list = [...list].sort((a: Product, b: Product) => Number(b.rating) - Number(a.rating)); break;
      default: break;
    }
    return list;
  }, [products, search]);

  const page = search.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, page: 1, ...patch }) as never });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Shop</h1>
        <p className="text-muted-foreground">{filtered.length} products</p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <form
          onSubmit={(e) => { e.preventDefault(); update({ q: qLocal || undefined }); }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products or brands…"
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select value={search.category ?? "all"} onValueChange={(v) => update({ category: v === "all" ? undefined : v })}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={search.sort ?? "newest"} onValueChange={(v) => update({ sort: v as typeof search.sort })}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min $"
            className="w-24"
            value={search.min ?? ""}
            onChange={(e) => update({ min: e.target.value ? Number(e.target.value) : undefined })}
          />
          <Input
            type="number"
            placeholder="Max $"
            className="w-24"
            value={search.max ?? ""}
            onChange={(e) => update({ max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          No products match those filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {paged.map((p: Product) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              to="/products"
              search={(prev: typeof search) => ({ ...prev, page: i + 1 }) as never}
              className={`grid h-9 w-9 place-items-center rounded-md border text-sm ${page === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}

      {(search.q || search.category || search.min || search.max) && (
        <div className="mt-6 flex justify-center">
          <Button variant="ghost" onClick={() => { setQLocal(""); navigate({ search: {} as never }); }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
