"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

const HREF = "/admin/tools/new";

/** "Add Tool" CTA on the Manage Tools page. A plain <Link> prefetches the route,
 *  so its pending state can flash by too fast to see; driving the navigation
 *  through useTransition keeps `pending` true for the whole DB-backed load, so
 *  the spinner is reliably visible. The href is kept so modified clicks
 *  (new tab, right-click) still behave like a normal link. */
export function AddToolButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <a
      href={HREF}
      aria-busy={pending}
      onClick={(e) => {
        // Let the browser handle new-tab / new-window clicks natively.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (pending) return;
        startTransition(() => router.push(HREF));
      }}
      className="bg-primary-container text-on-primary-container hover:bg-primary transition-colors flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-label-sm text-sm aria-busy:opacity-80 aria-busy:cursor-wait"
    >
      <span
        className={`material-symbols-outlined text-[18px] ${pending ? "animate-spin" : ""}`}
      >
        {pending ? "progress_activity" : "add"}
      </span>
      {pending ? "Opening…" : "Add Tool"}
    </a>
  );
}
