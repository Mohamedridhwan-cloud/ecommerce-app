import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Azura" }, { name: "robots", content: "noindex" }] }),
  component: Checkout,
});

const addressSchema = z.object({
  full_name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email().max(255),
  street: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100),
  postal_code: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: user?.email ?? "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Please sign in to checkout</h1>
        <Button asChild className="mt-6"><Link to="/auth">Sign in</Link></Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <Button asChild className="mt-6"><Link to="/products">Shop products</Link></Button>
      </div>
    );
  }

  const shipping = subtotal >= 50 ? 0 : 8;
  const total = subtotal + shipping;

  const placeOrder = async () => {
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: total,
        shipping_address: parsed.data,
        payment_status: "Paid",
        order_status: "Pending",
      })
      .select()
      .single();
    if (error || !order) {
      toast.error(error?.message ?? "Failed");
      setSubmitting(false);
      return;
    }
    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product.name,
        product_image: i.product.image,
        quantity: i.quantity,
        price: i.product.price,
      })),
    );
    if (itemsErr) {
      toast.error(itemsErr.message);
      setSubmitting(false);
      return;
    }
    await clear();
    toast.success("Order placed!");
    navigate({ to: "/account/orders/$id", params: { id: order.id } });
  };

  return (
    <div className="container mx-auto grid gap-10 px-4 py-10 lg:grid-cols-[1fr_400px]">
      <div>
        <h1 className="font-display text-3xl font-bold">Checkout</h1>
        <div className="mt-6 grid gap-4">
          <h2 className="font-semibold">Shipping information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" v={form.full_name} on={(v) => setForm({ ...form, full_name: v })} />
            <Field label="Email" v={form.email} on={(v) => setForm({ ...form, email: v })} type="email" />
            <Field label="Street address" v={form.street} on={(v) => setForm({ ...form, street: v })} className="sm:col-span-2" />
            <Field label="City" v={form.city} on={(v) => setForm({ ...form, city: v })} />
            <Field label="State / region" v={form.state} on={(v) => setForm({ ...form, state: v })} />
            <Field label="Postal code" v={form.postal_code} on={(v) => setForm({ ...form, postal_code: v })} />
            <Field label="Country" v={form.country} on={(v) => setForm({ ...form, country: v })} />
          </div>
        </div>
      </div>
      <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold">Order summary</h2>
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between text-sm">
              <span className="line-clamp-1">{i.product.name} × {i.quantity}</span>
              <span>{money(i.quantity * Number(i.product.price))}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t pt-4 text-sm">
          <Row label="Subtotal" value={money(subtotal)} />
          <Row label="Shipping" value={shipping === 0 ? "Free" : money(shipping)} />
          <Row label="Total" value={money(total)} bold />
        </div>
        <Button size="lg" className="w-full" disabled={submitting} onClick={placeOrder}>
          {submitting ? "Placing order…" : "Place order"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Demo checkout — no real payment is processed.</p>
      </aside>
    </div>
  );
}

function Field({ label, v, on, type = "text", className = "" }: { label: string; v: string; on: (v: string) => void; type?: string; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Input value={v} type={type} onChange={(e) => on(e.target.value)} />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span><span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
