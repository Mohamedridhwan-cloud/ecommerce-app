import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { money } from "@/lib/format";
import { useNavigate } from "@tanstack/react-router";

export function CartDrawer() {
  const { open, setOpen, items, subtotal, setQty, remove } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display">Your cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button onClick={() => { setOpen(false); navigate({ to: "/products" }); }}>Continue shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-4">
                {items.map((it) => (
                  <li key={it.id} className="flex gap-3 rounded-xl border p-3">
                    <div className="h-20 w-20 overflow-hidden rounded-lg bg-muted">
                      {it.product.image && (
                        <img src={it.product.image} alt={it.product.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-medium">{it.product.name}</p>
                        <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground">{money(it.product.price)}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border">
                          <button onClick={() => setQty(it.id, it.quantity - 1)} className="grid h-7 w-7 place-items-center hover:bg-muted">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-6 text-center text-sm">{it.quantity}</span>
                          <button onClick={() => setQty(it.id, it.quantity + 1)} className="grid h-7 w-7 place-items-center hover:bg-muted">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold">{money(it.quantity * Number(it.product.price))}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{money(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
              <Button className="w-full" size="lg" onClick={() => { setOpen(false); navigate({ to: "/checkout" }); }}>
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
