import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth-guard';
import { getAuditLogs } from '@/app/actions/auditActions';
import AuditLogClient from './AuditLogClient';

export const metadata = {
  title: 'Admin - Audit Log',
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; actor?: string; page?: string }>;
}) {
  // Identity check for a friendly redirect; getAuditLogs re-enforces primary-only.
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/login?next=/admin/audit-log');
  if (!admin.isPrimaryAdmin) redirect('/admin');

  const sp = await searchParams;
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const data = await getAuditLogs({ action: sp.action, actor: sp.actor, page });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display-lg text-3xl font-bold tracking-tight text-on-surface">Audit Log</h1>
        <p className="font-body-base text-on-surface-variant mt-2">
          Every authenticated change and sign-in, newest first. Use it to trace who did what, when, and from where.
        </p>
      </div>

      <AuditLogClient
        logs={data.logs}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        actions={data.actions}
        filterAction={sp.action ?? ''}
        filterActor={sp.actor ?? ''}
      />
    </div>
  );
}
