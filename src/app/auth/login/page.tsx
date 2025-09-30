"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }

    // Get stored user & check admin
    const user = data.user;
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user?.id)
      .single();

    if (profile?.is_admin) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={onLogin} className="space-y-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full p-2 border rounded"
        />
        {err && <div className="text-red-600">{err}</div>}
        <div className="flex gap-2">
          <button
            disabled={loading}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </main>
  );
}
