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
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    const message = await register({ name, email, phone, password });
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
          {error && <p className="text-sm">{error}</p>}
        <button className="h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream">CREATE ACCOUNT</button>
      </form>
      <p className="mt-4 text-sm">
        <Link href="/sign-in" className="underline">Already have an account</Link>
      </p>
    </AuthShell>
  );
}
