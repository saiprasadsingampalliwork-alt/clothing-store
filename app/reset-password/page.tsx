"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AuthShell, Input } from "@/components/auth";
import { useStore } from "@/lib/store";

export default function ResetPage() {
  const { requestPasswordReset, requestPasswordCode, resetPassword, resetPasswordWithCode, ready: studioReady } = useStore();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [channel, setChannel] = useState<"email" | "whatsapp">("whatsapp");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
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

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    const result = await requestPasswordCode(phone);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPreviewCode(result.previewCode ?? null);
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

  async function choosePasswordWithCode(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setError(null);
    const message = await resetPasswordWithCode(phone, code, password);
    if (message) {
      setError(message);
      return;
    }
    setDone(true);
  }

  if (!ready) return null;

  const intro = token
    ? "Choose a new password. This link expires 30 minutes after it was sent."
    : channel === "whatsapp"
      ? "Enter the mobile on your account. We'll WhatsApp a 6-digit code. It expires in 10 minutes."
      : "Enter your email and we will send a link. It expires in 30 minutes.";

  return (
    <AuthShell title="Reset password" text={intro}>
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
      ) : sent && channel === "email" ? (
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
      ) : sent ? (
        <form onSubmit={choosePasswordWithCode} className="space-y-3">
          <p className="text-sm">If an account uses that mobile, the WhatsApp code is on its way.</p>
          {previewCode && <p className="text-sm">WhatsApp is not configured yet, so the code is shown here: {previewCode}</p>}
          <Input label="Code" value={code} onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))} />
          <Input label="New password" type="password" value={password} onChange={setPassword} />
          {error && <p className="text-sm">{error}</p>}
          <button disabled={!studioReady} className="h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream disabled:opacity-50">UPDATE PASSWORD</button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["whatsapp", "email"] as const).map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => {
                  setChannel(option);
                  setError(null);
                }}
                className={`h-11 border px-4 text-sm ${channel === option ? "border-ink bg-paper" : "border-line"}`}
              >
                {option === "whatsapp" ? "WhatsApp" : "Email"}
              </button>
            ))}
          </div>
          {channel === "whatsapp" ? (
            <form onSubmit={requestCode} className="space-y-3">
              <Input label="Mobile" value={phone} onChange={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))} />
              {error && <p className="text-sm">{error}</p>}
              <button disabled={!studioReady} className="h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream disabled:opacity-50">SEND CODE</button>
            </form>
          ) : (
            <form onSubmit={requestLink} className="space-y-3">
              <Input label="Email" type="email" value={email} onChange={setEmail} />
              {error && <p className="text-sm">{error}</p>}
              <button disabled={!studioReady} className="h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream disabled:opacity-50">SEND LINK</button>
            </form>
          )}
        </div>
      )}
    </AuthShell>
  );
}
