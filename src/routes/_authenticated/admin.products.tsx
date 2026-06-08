import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type ProductRow = {
  id: string; name: string; description: string; category: string;
  price: number; stock: number; image: string | null; brand: string | null; rating: number;
};

const empty: Omit<ProductRow, "id"> = {
  name: "", description: "", category: "Electronics", price: 0, stock: 0, image: "", brand: "", rating: 0,
};

function AdminProducts() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProductRow[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [form, setForm] = useState<Omit<ProductRow, "id">>(empty);

  const startCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (p: ProductRow) => { setEditing(p); const { id: _id, ...rest } = p; void _id; setForm(rest); setOpen(true); };

  const save = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      rating: Number(form.rating),
      image: form.image || null,
    };
    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Product created");
    }
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["featured-products"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startCreate}><Plus className="mr-1 h-4 w-4" /> New product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Fld label="Name" v={form.name} on={(v) => setForm({ ...form, name: v })} />
              <div>
                <Label className="mb-1.5 block text-sm">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Fld label="Category" v={form.category} on={(v) => setForm({ ...form, category: v })} />
                <Fld label="Brand" v={form.brand ?? ""} on={(v) => setForm({ ...form, brand: v })} />
                <Fld label="Price" type="number" v={String(form.price)} on={(v) => setForm({ ...form, price: Number(v) })} />
                <Fld label="Stock" type="number" v={String(form.stock)} on={(v) => setForm({ ...form, stock: Number(v) })} />
                <Fld label="Rating (0-5)" type="number" v={String(form.rating)} on={(v) => setForm({ ...form, rating: Number(v) })} />
                <Fld label="Image URL" v={form.image ?? ""} on={(v) => setForm({ ...form, image: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                      {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{money(p.price)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Fld({ label, v, on, type = "text" }: { label: string; v: string; on: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      <Input type={type} value={v} onChange={(e) => on(e.target.value)} />
    </div>
  );
}
