import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Azura" }, { name: "robots", content: "noindex" }] }),
  component: Auth,
});

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6, "At least 6 characters").max(128);

function Auth() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ec = emailSchema.safeParse(email);
    const pc = passwordSchema.safeParse(password);
    if (!ec.success) return toast.error("Enter a valid email");
    if (!pc.success) return toast.error(pc.error.issues[0].message);
    setBusy(true);
    const { error } = tab === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, name);
    setBusy(false);
    if (error) return toast.error(error);
    if (tab === "signup") toast.success("Account created! Welcome.");
    navigate({ to: "/" });
  };

  return (
    <div className="container mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border bg-card p-8 shadow-card">
        <h1 className="font-display text-2xl font-bold">Welcome to Azura</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to shop and track orders.</p>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form className="mt-4 space-y-4" onSubmit={submit}>
              <Fld label="Email" v={email} on={setEmail} type="email" />
              <Fld label="Password" v={password} on={setPassword} type="password" />
              <Button className="w-full" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form className="mt-4 space-y-4" onSubmit={submit}>
              <Fld label="Full name" v={name} on={setName} />
              <Fld label="Email" v={email} on={setEmail} type="email" />
              <Fld label="Password" v={password} on={setPassword} type="password" />
              <Button className="w-full" disabled={busy} type="submit">{busy ? "Creating…" : "Create account"}</Button>
              <p className="text-center text-xs text-muted-foreground">
                The first account becomes admin.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Fld({ label, v, on, type = "text" }: { label: string; v: string; on: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      <Input type={type} value={v} onChange={(e) => on(e.target.value)} required />
    </div>
  );
}
