import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Audit trail writer. One call records one immutable event (who / what / where).
 *
 * Design rules:
 *  - The actor is a *snapshot* (id/email/role), never a FK — a removed user must
 *    still appear in history and a write must never fail on a constraint.
 *  - Writing the log must NEVER break the user-facing action it describes, so
 *    every failure here is swallowed (and logged to the server console).
 *  - Must be called within a request scope (Server Action / Route Handler /
 *    Server Component) so `headers()` can read IP + user-agent.
 */

export type AuditActor = {
  id?: string | null;
  email?: string | null;
  role?: string | null;
};

type AuditEntry = {
  action: string;
  actor?: AuditActor | null;
  status?: "SUCCESS" | "FAILURE";
  targetType?: string;
  targetId?: string;
  targetLabel?: string | null;
  metadata?: unknown;
};

/** Pulls the best-effort client IP from proxy headers (Vercel sets these). */
async function readRequestContext() {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    const ip =
      (forwarded ? forwarded.split(",")[0] : h.get("x-real-ip"))?.trim() || null;
    const userAgent = h.get("user-agent");
    return { ip, userAgent: userAgent || null };
  } catch {
    // headers() throws outside a request scope (e.g. during build/seed).
    return { ip: null, userAgent: null };
  }
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const { ip, userAgent } = await readRequestContext();

    await prisma.auditLog.create({
      data: {
        action: entry.action,
        status: entry.status ?? "SUCCESS",
        actorId: entry.actor?.id ?? null,
        actorEmail: entry.actor?.email ?? null,
        actorRole: entry.actor?.role ?? null,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        targetLabel: entry.targetLabel ?? null,
        metadata:
          entry.metadata === undefined || entry.metadata === null
            ? null
            : JSON.stringify(entry.metadata),
        ip,
        userAgent,
      },
    });
  } catch (err) {
    // Audit logging is best-effort: never let it surface to the user.
    console.error(`[audit] failed to record "${entry.action}":`, err);
  }
}
