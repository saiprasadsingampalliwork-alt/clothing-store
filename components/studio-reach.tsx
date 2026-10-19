"use client";

import { phoneHref, siteContent } from "@/lib/site";
import { useStore } from "@/lib/store";

export function StudioReach() {
  const studio = siteContent(useStore().settings);
  return (
    <>
      If you want to talk to a person, call {studio.phone} or write to {studio.email}. {studio.hours}.
    </>
  );
}
