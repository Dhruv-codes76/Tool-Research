import React from 'react';
import ManageAdminsClient from './ManageAdminsClient';
import { getAdmins } from '@/app/actions/adminManagementActions';

export const metadata = {
  title: 'Admin - Manage Admins',
};

export default async function ManageAdminsPage() {
  const { admins, removed, viewerId, viewerIsPrimary } = await getAdmins();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display-lg text-3xl font-bold tracking-tight text-on-surface">Manage Admins</h1>
        <p className="font-body-base text-on-surface-variant mt-2">
          Invite admins by email. Only the primary admin can remove or revoke access.
        </p>
      </div>

      <ManageAdminsClient
        initialAdmins={admins}
        removedAdmins={removed}
        viewerId={viewerId}
        viewerIsPrimary={viewerIsPrimary}
      />
    </div>
  );
}
