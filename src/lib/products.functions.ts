import { createServerFn } from "@tanstack/react-start";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
});

export const getFeaturedProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("rating", { ascending: false })
    .limit(8);
  if (error) throw error;
  return (data ?? []) as Product[];
});
