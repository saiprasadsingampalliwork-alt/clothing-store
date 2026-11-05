"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { apiActivity, notePressed, subscribeApiActivity } from "@/lib/api";

const SHOW_AFTER_MS = 150; // quick requests do not flash the bar
const SLOW_AFTER_MS = 4000; // long enough that a word helps

const idle = { inflight: 0, since: null };

/**
 * Shows the site is working whenever it talks to the server: a thin line across the top of the page,
 * a sweep on the button that was pressed (see globals.css, [data-busy]), and after a few seconds a short
 * note, since a free server can take a while to wake up.
 */
export function ActivityIndicator() {
  const activity = useSyncExternalStore(subscribeApiActivity, apiActivity, () => idle);
  const [now, setNow] = useState(0);

  // Remember which button was pressed; a request it starts will mark it busy. Busy buttons ignore repeat presses.
  useEffect(() => {
    const press = (event: Event) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("button, [role='button'], input[type='submit']") : null;
      if (!target) return;
      if (target.hasAttribute("data-busy")) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      notePressed(target);
    };
    const submit = (event: SubmitEvent) => {
      const submitter = event.submitter instanceof HTMLElement ? event.submitter : null;
      if (submitter?.hasAttribute("data-busy")) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (submitter) notePressed(submitter);
    };
    document.addEventListener("click", press, true);
    document.addEventListener("submit", submit, true);
    return () => {
      document.removeEventListener("click", press, true);
      document.removeEventListener("submit", submit, true);
    };
  }, []);

  // Tick while busy, to decide when to show the bar and the note.
  useEffect(() => {
    if (!activity.inflight) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 150);
    return () => clearInterval(timer);
  }, [activity.inflight]);

  const elapsed = activity.since && now ? now - activity.since : 0;
  const working = activity.inflight > 0 && elapsed >= SHOW_AFTER_MS;
  const slow = activity.inflight > 0 && elapsed >= SLOW_AFTER_MS;

  return (
    <>
      <div className={`activity-bar ${working ? "on" : ""}`} role="progressbar" aria-hidden={!working} aria-label="Working" />
      <div className={`activity-note ${slow ? "on" : ""}`} role="status" aria-live="polite">
        {slow && (
          <>
            <span className="activity-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            Still working… if the shop has been quiet, the server can take up to a minute to wake up.
          </>
        )}
      </div>
    </>
  );
}
