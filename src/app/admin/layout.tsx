import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { AdminShell } from '@/components/admin/AdminShell';

// Admin pages require auth and query the database, so they must render on
// demand — never statically prerendered at build time.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdmin();
  if (!user) redirect('/login?next=/admin');

  const submissionCount = await prisma.tool.count({ where: { status: 'PENDING' } });

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, isPrimaryAdmin: user.isPrimaryAdmin }}
      submissionCount={submissionCount}
    >
      {children}
    </AdminShell>
  );
}
