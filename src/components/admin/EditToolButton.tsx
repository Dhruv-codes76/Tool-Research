"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/** Edit action for a tool row on the Manage Tools page. Drives the navigation
 *  through useTransition (rather than a prefetched <Link>) so `pending` stays
 *  true for the whole DB-backed load and the spinner is reliably visible. The
 *  href is kept so modified clicks still open the edit page normally. */
export function EditToolButton({ toolId }: { toolId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = `/admin/tools/${toolId}/edit`;

  return (
    <a
      href={href}
      aria-label="Edit tool"
      aria-busy={pending}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (pending) return;
        startTransition(() => router.push(href));
      }}
      className="p-1.5 hover:text-primary transition-colors hover:bg-surface-container rounded-md aria-busy:cursor-wait"
    >
      <span
        className={`material-symbols-outlined text-[18px] ${pending ? "animate-spin" : ""}`}
      >
        {pending ? "progress_activity" : "edit"}
      </span>
    </a>
  );
}
