"use server";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase-server";
import { requirePrimaryAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit-log";

/**
 * Record an authentication event (login / logout) from the client.
 *
 * SECURITY: we never trust a client-supplied identity. Identity is resolved by
 * *verifying a JWT* — either the access token the client passes (validated
 * against Supabase's auth server via getUser(jwt)) or, as a fallback, the
 * cookie session. The browser client stores its session in localStorage rather
 * than cookies, so the access-token path is the reliable one right after a
 * client-side sign-in. A forged/expired token resolves to no user and is
 * dropped — a visitor cannot fabricate an entry for someone else.
 */
const ALLOWED_AUTH_ACTIONS = new Set([
  "auth.login",
  "auth.logout",
]);

async function resolveVerifiedEmail(accessToken?: string): Promise<string | null> {
  if (accessToken) {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    );
    const { data } = await client.auth.getUser(accessToken);
    return data.user?.email ?? null;
  }

  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export async function logAuthEvent(action: string, accessToken?: string) {
  if (!ALLOWED_AUTH_ACTIONS.has(action)) return;

  let email: string | null = null;
  try {
    email = await resolveVerifiedEmail(accessToken);
  } catch {
    return; // verification failed → drop silently
  }
  if (!email) return; // nothing trustworthy to log

  // Snapshot role from our own DB when we know the person; harmless if absent.
  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  await logAudit({
    action,
    actor: {
      id: dbUser?.id ?? null,
      email: dbUser?.email ?? email,
      role: dbUser?.role ?? null,
    },
    targetType: "User",
    targetId: dbUser?.id ?? undefined,
    targetLabel: dbUser?.email ?? email,
  });
}

const PAGE_SIZE = 50;

export type AuditLogFilters = {
  action?: string;
  actor?: string; // matches actorEmail (contains, case-insensitive)
  page?: number;
};

/**
 * Read the audit trail for the admin UI. PRIMARY ADMIN ONLY — the trail can
 * expose IPs and every admin's activity, so it stays behind the highest gate.
 */
export async function getAuditLogs(filters: AuditLogFilters = {}) {
  await requirePrimaryAdmin();

  const page = Math.max(1, filters.page ?? 1);
  const action = filters.action?.trim();
  const actor = filters.actor?.trim();

  const where = {
    ...(action ? { action } : {}),
    ...(actor
      ? { actorEmail: { contains: actor, mode: "insensitive" as const } }
      : {}),
  };

  const [logs, total, distinctActions] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ["action"],
      select: { action: true },
      orderBy: { action: "asc" },
    }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    actions: distinctActions.map((a) => a.action),
  };
}
