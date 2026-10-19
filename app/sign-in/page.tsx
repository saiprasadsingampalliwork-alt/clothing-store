"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Input } from "@/components/auth";
import { siteContent } from "@/lib/site";
import { useStore } from "@/lib/store";

export default function SignInPage() {
  const { signIn, settings } = useStore();
  const loginImage = siteContent(settings).loginImage;
  const router = useRouter();
  const [email, setEmail] = useState("aisha@earthen.in");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (done) return;
    setError(null);
    const message = await signIn(email, password);
    if (message) {
      setError(message);
      return;
    }
    setDone(true);
    window.setTimeout(() => router.push("/account"), 900);
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
        <form onSubmit={submit} className="grid w-full max-w-sm gap-4">
          <h1 className="serif settle text-4xl [--i:2]">Welcome back</h1>
          <p className="settle text-sm text-muted [--i:3]">Sign in to track orders and check out faster.</p>
          <div className="settle [--i:4]">
            <Input label="Email" type="email" value={email} onChange={setEmail} />
          </div>
          <div className="settle [--i:5]">
            <Input label="Password" type="password" value={password} onChange={setPassword} />
          </div>
          {error && <p className="text-sm">{error}</p>}
          <button className={`motion-btn settle relative h-12 w-full bg-terra text-sm tracking-[0.16em] text-cream [--i:6] ${done ? "done" : ""}`}>
            <span className="lbl">SIGN IN</span>
            <span className="tick" aria-hidden="true">
              ✓
            </span>
          </button>
          <p className="settle text-center text-sm [--i:7]">
            <Link href="/reset-password" className="underline">
              Forgot password?
            </Link>
            <span className="mx-2 text-muted">New here?</span>
            <Link href="/register" className="underline">
              Create an account
            </Link>
          </p>
          <p className="text-center text-sm text-muted">Aisha&apos;s account is aisha@earthen.in, password quietclothes.</p>
          <button className="replay" type="button" onClick={replayEntrance}>
            Replay entrance
          </button>
        </form>
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
