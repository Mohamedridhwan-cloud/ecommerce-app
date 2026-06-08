import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    stock: number;
  };
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (productId: string, qty?: number) => Promise<void>;
  remove: (cartItemId: string) => Promise<void>;
  setQty: (cartItemId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, product:products(id,name,price,image,stock)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setItems(((data as unknown) as CartItem[]) ?? []);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add: CartCtx["add"] = async (productId, qty = 1) => {
    if (!user) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await setQty(existing.id, existing.quantity + qty);
      toast.success("Cart updated");
      return;
    }
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, product_id: productId, quantity: qty });
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
    toast.success("Added to cart");
  };

  const remove: CartCtx["remove"] = async (cartItemId) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
    if (error) return toast.error(error.message);
    await refresh();
  };

  const setQty: CartCtx["setQty"] = async (cartItemId, qty) => {
    if (qty <= 0) return remove(cartItemId);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: qty })
      .eq("id", cartItemId);
    if (error) return toast.error(error.message);
    await refresh();
  };

  const clear = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    await refresh();
  };

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * Number(i.product?.price ?? 0), 0),
    [items],
  );

  return (
    <Ctx.Provider value={{ items, count, subtotal, open, setOpen, add, remove, setQty, clear, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
