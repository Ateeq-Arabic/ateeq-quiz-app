"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
      return;
    }

    // After sign up, user is created; profile is created by DB trigger
    setMsg(
      "Registration successful. Please check your email if confirmation required."
    );
    // Optionally navigate to login
    router.push("/auth/login");
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={onRegister} className="space-y-3">
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
        {msg && <div className="text-sm text-[var(--muted)]">{msg}</div>}
        <div className="flex gap-2">
          <button
            disabled={loading}
            className="px-4 py-2 bg-[var(--primary)] text-white rounded"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </main>
  );
}
