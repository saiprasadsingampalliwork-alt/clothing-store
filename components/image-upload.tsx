"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const LIMIT = 6 * 1024 * 1024;

export function ImageUpload({
  label,
  hint,
  onUploaded,
  layout = "button",
  fill = false,
}: {
  label: string;
  hint?: string;
  onUploaded: (url: string) => void;
  layout?: "button" | "frame";
  fill?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    const type = file.type.toLowerCase();
    const named = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (type && !/^image\/(jpeg|jpg|png|webp)$/.test(type)) {
      setError("Use a JPEG, PNG, or WebP photo.");
      return;
    }
    if (!type && !named) {
      setError("Use a JPEG, PNG, or WebP photo.");
      return;
    }
    if (file.size > LIMIT) {
      setError("Use a photo under 6 MB.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await readFile(file);
      if (data.length > 10_000_000) {
        setError("Use a photo under 6 MB.");
        return;
      }
      const saved = await api<{ url: string }>("/uploads", { method: "POST", body: JSON.stringify({ data }) });
      onUploaded(saved.url);
    } catch (reason) {
      setError(plainUploadError(reason));
    } finally {
      setBusy(false);
    }
  }

  const input = (
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      disabled={busy}
      onChange={(event) => {
        void pick(event.target.files?.[0]);
        event.target.value = "";
      }}
    />
  );

  if (layout === "frame") {
    return (
      <div>
        <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#c4bfb6] bg-[#fbf8f4] px-3 text-center hover:border-[#2a2925]">
          <span className="text-sm">{busy ? "Uploading…" : label}</span>
          {hint && <span className="text-xs leading-5 text-[#6d6960]">{hint}</span>}
          {input}
        </label>
        {error && <p className="mt-2 text-xs leading-5 text-[#ab6446]">{error}</p>}
      </div>
    );
  }

  return (
    <span className={`inline-flex flex-col gap-1 ${fill ? "w-full items-stretch" : "items-start"}`}>
      <label className={`inline-flex h-9 cursor-pointer items-center border border-[#2a2925] text-[11px] tracking-[0.14em] ${fill ? "w-full justify-center px-2" : "px-3"}`}>
        {busy ? "UPLOADING" : label}
        {input}
      </label>
      {error && <span className="max-w-full text-xs leading-5 text-[#ab6446]">{error}</span>}
    </span>
  );
}

function plainUploadError(reason: unknown) {
  const message = reason instanceof Error ? reason.message : "";
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return "The studio could not be reached, so the photo was not added. Try again in a moment.";
  }
  return message || "Could not upload that photo.";
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}
