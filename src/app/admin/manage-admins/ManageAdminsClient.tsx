'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  inviteAdmin,
  resendInvite,
  editAdmin,
  revokeInvite,
  removeAdmin,
  restoreAdmin,
} from '@/app/actions/adminManagementActions';

type AdminRow = {
  id: string;
  name: string | null;
  email: string | null;
  status: string; // INVITED | ACTIVE | DELETED
  isPrimaryAdmin: boolean;
  invitedAt: Date | string | null;
  acceptedAt: Date | string | null;
  invitedBy: { name: string | null; email: string | null } | null;
};

interface Props {
  initialAdmins: AdminRow[];
  removedAdmins: AdminRow[];
  viewerId: string;
  viewerIsPrimary: boolean;
}

export default function ManageAdminsClient({ initialAdmins, removedAdmins, viewerId, viewerIsPrimary }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Edit-name modal (primary only)
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [editName, setEditName] = useState('');

  const run = (fn: () => Promise<unknown>, successMsg: string, after?: () => void) => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await fn();
        setFeedback({ type: 'success', msg: successMsg });
        after?.();
        router.refresh();
      } catch (err) {
        setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Something went wrong.' });
      }
    });
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const target = email.trim();
    run(() => inviteAdmin(target), `Invite sent to ${target}.`);
    setEmail('');
  };

  const openEdit = (a: AdminRow) => {
    setEditing(a);
    setEditName(a.name || '');
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editName.trim()) return;
    const id = editing.id;
    run(() => editAdmin(id, editName.trim()), 'Admin details updated.', () => setEditing(null));
  };

  return (
    <div className="space-y-6">
      {/* Invite form — PRIMARY ONLY */}
      {viewerIsPrimary && (
        <form
          onSubmit={handleInvite}
          className="flex flex-col sm:flex-row gap-3 bg-surface border border-outline-variant/20 rounded-xl p-4 shadow-sm"
        >
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px]">
              mail
            </span>
            <input
              type="email"
              placeholder="new-admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-outline-variant/30 rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || !email.trim()}
            className="shrink-0 flex items-center justify-center gap-2 bg-[#2d0096] text-white hover:bg-[#3600b3] px-5 py-2.5 rounded-lg text-sm font-label-sm font-bold transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            {isPending ? 'Working…' : 'Invite Admin'}
          </button>
        </form>
      )}

      {/* Read-only notice for non-primary admins */}
      {!viewerIsPrimary && (
        <div className="flex items-start gap-2 rounded-lg border border-outline-variant/20 bg-surface px-4 py-3 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">visibility</span>
          <span>View-only. Only the primary admin can invite, edit, or remove admins.</span>
        </div>
      )}

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-green-500/20 bg-green-500/10 text-green-400'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Admins table */}
      <div className="bg-surface border border-outline-variant/20 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/20 text-left text-on-surface-variant">
              <th className="px-5 py-3 font-label-sm font-semibold">Admin</th>
              <th className="px-5 py-3 font-label-sm font-semibold">Role</th>
              <th className="px-5 py-3 font-label-sm font-semibold">Status</th>
              <th className="px-5 py-3 font-label-sm font-semibold hidden md:table-cell">Invited by</th>
              {viewerIsPrimary && <th className="px-5 py-3 font-label-sm font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {initialAdmins.map((a: any) => {
              const isSelf = a.id === viewerId;
              const isInvited = a.status === 'INVITED';
              const canResend = viewerIsPrimary && isInvited;
              const canRevoke = viewerIsPrimary && isInvited && !a.isPrimaryAdmin;
              const canRemove = viewerIsPrimary && !isInvited && !a.isPrimaryAdmin && !isSelf;

              return (
                <tr key={a.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-label-sm font-bold shrink-0">
                        {(a.name || a.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-on-surface font-medium truncate">
                          {a.name || '—'} {isSelf && <span className="text-on-surface-variant font-normal">(you)</span>}
                        </p>
                        <p className="text-on-surface-variant text-xs truncate">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {a.isPrimaryAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ffb695] bg-[#571f00]/40 px-2 py-0.5 rounded-md tracking-wide uppercase">
                        <span className="material-symbols-outlined text-[12px]">shield_person</span>
                        Primary
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-[#c3c0ff] bg-[#4f46e5]/20 px-2 py-0.5 rounded-md tracking-wide uppercase">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {isInvited ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Invited
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-on-surface-variant text-xs">
                    {a.invitedBy ? (a.invitedBy.name || a.invitedBy.email) : <span className="opacity-50">—</span>}
                  </td>
                  {viewerIsPrimary && (
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          disabled={isPending}
                          className="flex items-center gap-1 text-xs text-on-surface hover:text-primary px-2 py-1 rounded-md hover:bg-surface-container transition-colors disabled:opacity-40"
                          title="Edit name"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          Edit
                        </button>
                        {canResend && (
                          <button
                            onClick={() => run(() => resendInvite(a.id), 'Invite re-sent.')}
                            disabled={isPending}
                            className="flex items-center gap-1 text-xs text-on-surface hover:text-primary px-2 py-1 rounded-md hover:bg-surface-container transition-colors disabled:opacity-40"
                            title="Resend invite"
                          >
                            <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                            Resend
                          </button>
                        )}
                        {canRevoke && (
                          <button
                            onClick={() => {
                              if (confirm(`Revoke the pending invite for ${a.email}?`)) {
                                run(() => revokeInvite(a.id), 'Invite revoked.');
                              }
                            }}
                            disabled={isPending}
                            className="flex items-center gap-1 text-xs text-error hover:text-error px-2 py-1 rounded-md hover:bg-error-container/10 transition-colors disabled:opacity-40"
                            title="Revoke invite"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_remove</span>
                            Revoke
                          </button>
                        )}
                        {canRemove && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove admin access for ${a.email}? This soft-deletes them.`)) {
                                run(() => removeAdmin(a.id), 'Admin removed.');
                              }
                            }}
                            disabled={isPending}
                            className="flex items-center gap-1 text-xs text-error hover:text-error px-2 py-1 rounded-md hover:bg-error-container/10 transition-colors disabled:opacity-40"
                            title="Remove admin"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Remove
                          </button>
                        )}
                        {a.isPrimaryAdmin && (
                          <span className="text-[11px] text-on-surface-variant/60 italic px-2">protected</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Removed admins — primary only, restore-able */}
      {viewerIsPrimary && removedAdmins.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-label-sm text-sm font-semibold text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person_off</span>
            Removed admins
          </h2>
          <div className="bg-surface border border-outline-variant/20 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {removedAdmins.map((a: any) => (
                  <tr key={a.id} className="border-b border-outline-variant/10 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 opacity-70">
                        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant font-label-sm font-bold shrink-0">
                          {(a.name || a.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-on-surface font-medium truncate">{a.name || '—'}</p>
                          <p className="text-on-surface-variant text-xs truncate">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50" /> Removed
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => run(() => restoreAdmin(a.id), 'Admin restored.')}
                        disabled={isPending}
                        className="inline-flex items-center gap-1 text-xs text-on-surface hover:text-primary px-2 py-1 rounded-md hover:bg-surface-container transition-colors disabled:opacity-40"
                        title="Restore admin"
                      >
                        <span className="material-symbols-outlined text-[16px]">restore</span>
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit-name modal (primary only) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => !isPending && setEditing(null)} />
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-outline-variant/20">
            <div className="p-6">
              <h2 className="text-xl font-headline-md text-on-surface mb-1">Edit Admin</h2>
              <p className="text-xs text-on-surface-variant mb-6">
                Email is the unique identifier and can’t be changed.
              </p>
              <form onSubmit={handleEditSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editing.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-surface-container border border-outline-variant/30 rounded-lg text-sm text-on-surface-variant/70 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/30 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !editName.trim()}
                    className="bg-[#2d0096] text-white hover:bg-[#3600b3] px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
