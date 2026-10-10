"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell, Input } from "@/components/auth";
import { useStore } from "@/lib/store";

export default function ResetPage() {
  const { resetPassword } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    const message = await resetPassword(email, password);
    if (message) {
      setError(message);
      return;
    }
    setDone(true);
  }

  return (
    <AuthShell title="Reset password" text="The full site emails a link that expires. Here you can set a new password directly.">
      {done ? (
        <p className="text-sm">
          Password updated. <Link href="/sign-in" className="underline">Sign in</Link>
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Input label="Email" type="email" value={email} onChange={setEmail} />
          <Input label="New password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-sm">{error}</p>}
          <button className="h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream">UPDATE PASSWORD</button>
        </form>
      )}
    </AuthShell>
  );
}
