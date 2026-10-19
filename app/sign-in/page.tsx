"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Input } from "@/components/auth";
import { siteContent } from "@/lib/site";
import { useStore } from "@/lib/store";

export default function SignInPage() {
  const { signIn, requestSignInCode, signInWithCode, settings } = useStore();
  const loginImage = siteContent(settings).loginImage;
  const router = useRouter();
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function enter() {
    setDone(true);
    window.setTimeout(() => router.push("/account"), 900);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (done) return;
    setError(null);
    const message = await signIn(email, password);
    if (message) {
      setError(message);
      return;
    }
    enter();
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    if (done) return;
    setError(null);
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    const result = await requestSignInCode(phone);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPreviewCode(result.previewCode ?? null);
    setCodeSent(true);
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault();
    if (done) return;
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    const message = await signInWithCode(phone, code);
    if (message) {
      setError(message);
      return;
    }
    enter();
  }

  function replayEntrance() {
    document.querySelectorAll<HTMLElement>(".login-screen .settle").forEach((el) => {
      el.style.animation = "none";
      void el.offsetHeight;
      el.style.animation = "";
    });
  }

  return (
    <div className="login-screen grid min-h-[calc(100svh-var(--header-h))] md:grid-cols-2">
      <section className="login-panel relative flex items-center justify-center px-5 py-12 md:px-8">
        <div className="grid w-full max-w-sm gap-4">
          <h1 className="serif settle text-4xl [--i:2]">Welcome back</h1>
          <p className="settle text-sm text-muted [--i:3]">Sign in with email, or with a WhatsApp code to the mobile on your account.</p>
          <div className="settle flex gap-2 [--i:4]">
            {(["email", "whatsapp"] as const).map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => {
                  setChannel(option);
                  setError(null);
                  setCodeSent(false);
                }}
                className={`h-11 border px-4 text-sm ${channel === option ? "border-ink bg-paper" : "border-line"}`}
              >
                {option === "email" ? "Email" : "WhatsApp"}
              </button>
            ))}
          </div>
          {channel === "email" ? (
            <form onSubmit={submit} className="grid gap-4">
              <Input label="Email" type="email" value={email} onChange={setEmail} />
              <Input label="Password" type="password" value={password} onChange={setPassword} />
              {error && <p className="text-sm">{error}</p>}
              <button className={`motion-btn relative h-12 w-full bg-terra text-sm tracking-[0.16em] text-cream ${done ? "done" : ""}`}>
                <span className="lbl">SIGN IN</span>
                <span className="tick" aria-hidden="true">
                  ✓
                </span>
              </button>
            </form>
          ) : codeSent ? (
            <form onSubmit={submitCode} className="grid gap-4">
              <p className="text-sm">A WhatsApp code is on its way to this mobile.</p>
              {previewCode && <p className="text-sm">WhatsApp is not configured yet, so the code is shown here: {previewCode}</p>}
              <Input label="Code" value={code} onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))} />
              {error && <p className="text-sm">{error}</p>}
              <button className={`motion-btn relative h-12 w-full bg-terra text-sm tracking-[0.16em] text-cream ${done ? "done" : ""}`}>
                <span className="lbl">SIGN IN</span>
                <span className="tick" aria-hidden="true">
                  ✓
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                  setError(null);
                }}
                className="text-sm underline"
              >
                Use a different number
              </button>
            </form>
          ) : (
            <form onSubmit={sendCode} className="grid gap-4">
              <Input label="Mobile" value={phone} onChange={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))} />
              {error && <p className="text-sm">{error}</p>}
              <button className="motion-btn relative h-12 w-full bg-terra text-sm tracking-[0.16em] text-cream">
                <span className="lbl">SEND CODE</span>
              </button>
            </form>
          )}
          <p className="settle text-center text-sm [--i:7]">
            <Link href="/reset-password" className="underline">
              Forgot password?
            </Link>
            <span className="mx-2 text-muted">New here?</span>
            <Link href="/register" className="underline">
              Create an account
            </Link>
          </p>
          {/* <p className="text-center text-sm text-muted">Aisha&apos;s account is aisha@earthen.in, password quietclothes.</p> */}
          <button className="replay" type="button" onClick={replayEntrance}>
            Replay entrance
          </button>
        </div>
      </section>
      <section className="relative flex min-h-72 items-end overflow-hidden md:min-h-0">
        <img
          src={loginImage.src}
          alt={loginImage.alt}
          className="absolute inset-0 size-full object-cover object-[center_60%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-transparent" />
        <div className="relative p-7 text-cream md:p-12">
          <p className="settle text-[15px] tracking-[0.22em] [--i:0]">EARTHEN</p>
          <p className="serif settle mt-3 max-w-[11em] text-4xl leading-[1.1] md:text-5xl [--i:1]">Quiet clothes for every day.</p>
        </div>
      </section>
    </div>
  );
}
