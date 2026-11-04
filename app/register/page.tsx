"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell, Input } from "@/components/auth";
import { useStore } from "@/lib/store";

export default function RegisterPage() {
  const { register } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    const message = await register({ name, email, phone, password, whatsappOptIn });
    if (message) {
      setError(message);
      return;
    }
    router.push("/account");
  }

  return (
    <AuthShell title="Create account" text="Email, mobile, and a password. You can sign in later with that mobile on WhatsApp.">
      <form onSubmit={submit} className="space-y-3">
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Email" type="email" value={email} onChange={setEmail} />
        <Input label="Mobile" value={phone} onChange={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))} />
        <Input label="Password" type="password" value={password} onChange={setPassword} />
        <label className="flex items-start gap-3 text-sm leading-6">
          <input type="checkbox" checked={whatsappOptIn} onChange={(event) => setWhatsappOptIn(event.target.checked)} className="mt-1.5 h-4 w-4" />
          <span>
            Remind me on WhatsApp about pieces left in my bag or wishlist.
            <span className="block text-xs text-muted">Optional. Reply STOP any time. Order updates come either way.</span>
          </span>
        </label>
          {error && <p className="text-sm">{error}</p>}
        <button className="h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream">CREATE ACCOUNT</button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/sign-in" className="underline">Already have an account</Link>
      </p>
    </AuthShell>
  );
}
