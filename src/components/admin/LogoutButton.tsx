"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();
  async function onLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }
  return (
    <button onClick={onLogout} className="px-3 py-1 border rounded">
      Logout
    </button>
  );
}
