"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell, Input } from "@/components/auth";
import { useStore } from "@/lib/store";

export default function ResetPage() {
  const { requestPasswordReset, resetPassword, ready: studioReady } = useStore();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
    setReady(true);
  }, []);

  async function requestLink(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const result = await requestPasswordReset(email);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPreviewUrl(result.previewUrl ?? null);
    setSent(true);
  }

  async function choosePassword(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setError(null);
    const message = await resetPassword(token, password);
    if (message) {
      setError(message);
      return;
    }
    setDone(true);
  }

  if (!ready) return null;

  return (
    <AuthShell
      title="Reset password"
      text={token ? "Choose a new password. This link expires 30 minutes after it was sent." : "Enter your email and we will send a link. It expires in 30 minutes."}
    >
      {done ? (
        <p className="text-sm">
          Password updated. <Link href="/sign-in" className="underline">Sign in</Link>
        </p>
      ) : token ? (
        <form onSubmit={choosePassword} className="space-y-3">
          <Input label="New password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-sm">{error}</p>}
          <button disabled={!studioReady} className="h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream disabled:opacity-50">UPDATE PASSWORD</button>
        </form>
      ) : sent ? (
        <div className="space-y-3 text-sm">
          <p>If an account uses that email, the reset link is ready.</p>
          {previewUrl && (
            <p>
              The mail server is not configured yet, so the link is shown here.{" "}
              <a href={previewUrl} className="break-all underline">
                Set a new password
              </a>
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={requestLink} className="space-y-3">
          <Input label="Email" type="email" value={email} onChange={setEmail} />
          {error && <p className="text-sm">{error}</p>}
          <button disabled={!studioReady} className="h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream disabled:opacity-50">SEND LINK</button>
        </form>
      )}
    </AuthShell>
  );
}