import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account/")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (profile) setName(profile.full_name ?? ""); }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    refetch();
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h1 className="font-display text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account details.</p>
      <div className="mt-6 grid max-w-md gap-4">
        <div>
          <Label className="mb-1.5 block text-sm">Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm">Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button onClick={save} disabled={saving} className="w-fit">{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}
