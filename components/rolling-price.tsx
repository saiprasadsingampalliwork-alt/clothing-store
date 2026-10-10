"use client";

import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/lib/money";

export function RollingPrice({ value }: { value: number }) {
  const text = formatINR(value);
  const previous = useRef(text);
  const [roll, setRoll] = useState(false);

  useEffect(() => {
    if (previous.current === text) return;
    previous.current = text;
    setRoll(true);
    const timer = window.setTimeout(() => setRoll(false), 280);
    return () => window.clearTimeout(timer);
  }, [text]);

  return <span className={roll ? "price-roll" : undefined}>{text}</span>;
}