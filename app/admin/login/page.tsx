"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useStore } from "@/lib/store";

export default function AdminLoginPage() {
  const { staffSignIn, staff } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("owner@earthen.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = await staffSignIn(email, password);
    if (message) {
      setError(message);
      return;
    }
    router.push("/admin");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="tracking-[0.28em]">EARTHEN</p>
        <h1 className="serif mt-3 text-4xl">Studio</h1>
        <p className="mt-2 text-sm text-muted">Staff sign in. Customers use the store account.</p>
        <label className="mt-6 block text-sm">
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
        </label>
        <label className="mt-3 block text-sm">
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
        </label>
        {error && <p className="mt-3 text-sm text-terra">{error}</p>}
        {staff && <p className="mt-3 text-sm">Signed in as {staff.name}.</p>}
        <button className="mt-5 h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream">SIGN IN</button>
        <p className="mt-4 text-xs text-muted">Owner: owner@earthen.in / studio. Catalog and orders staff use the same password.</p>
      </form>
    </div>
  );
}
