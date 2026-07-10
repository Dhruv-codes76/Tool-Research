'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type AuditLogRow = {
  id: string;
  createdAt: Date | string;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  status: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  metadata: string | null;
  ip: string | null;
  userAgent: string | null;
};

type Props = {
  logs: AuditLogRow[];
  total: number;
  page: number;
  totalPages: number;
  actions: string[];
  filterAction: string;
  filterActor: string;
};

// Colour the action chip by the kind of verb so destructive events stand out.
function actionTone(action: string): string {
  if (/(delete|remove|revoke|reject)/.test(action)) {
    return 'bg-error-container/40 text-error border-error/30';
  }
  if (/(create|invite|submit|restore|accept)/.test(action)) {
    return 'bg-primary-container/40 text-on-primary-container border-primary/30';
  }
  if (/(update|edit)/.test(action)) {
    return 'bg-tertiary-container/40 text-on-tertiary-container border-tertiary/30';
  }
  if (action.startsWith('auth.')) {
    return 'bg-secondary-container/40 text-on-secondary-container border-secondary/30';
  }
  return 'bg-surface-container-high text-on-surface-variant border-outline-variant/30';
}

function formatTime(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function AuditLogClient({
  logs,
  total,
  page,
  totalPages,
  actions,
  filterAction,
  filterActor,
}: Props) {
  const router = useRouter();
  const [action, setAction] = useState(filterAction);
  const [actor, setActor] = useState(filterActor);
  const [expanded, setExpanded] = useState<string | null>(null);

  const navigate = (params: { action?: string; actor?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params.action) sp.set('action', params.action);
    if (params.actor) sp.set('actor', params.actor);
    if (params.page && params.page > 1) sp.set('page', String(params.page));
    const qs = sp.toString();
    router.push(`/admin/audit-log${qs ? `?${qs}` : ''}`);
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ action: action.trim(), actor: actor.trim(), page: 1 });
  };

  const clearFilters = () => {
    setAction('');
    setActor('');
    navigate({});
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="glass-panel rounded-xl border border-outline-variant/20 bg-surface-container-low/60 p-4 flex flex-wrap items-end gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-xs text-on-surface-variant">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All actions</option>
            {actions.map((a: any) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-xs text-on-surface-variant">Actor email</label>
          <input
            type="text"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="name@example.com"
            className="bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface min-w-[220px] focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-sm hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
          {(filterAction || filterActor) && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg border border-outline-variant/30 text-on-surface-variant font-label-sm text-sm hover:bg-surface-container transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="ml-auto font-body-base text-xs text-on-surface-variant">
          {total.toLocaleString()} {total === 1 ? 'entry' : 'entries'}
        </div>
      </form>

      {/* Table */}
      <div className="glass-panel rounded-xl border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low/60">
                <th className="px-4 py-3 font-label-sm text-xs text-on-surface-variant font-medium">When</th>
                <th className="px-4 py-3 font-label-sm text-xs text-on-surface-variant font-medium">Actor</th>
                <th className="px-4 py-3 font-label-sm text-xs text-on-surface-variant font-medium">Action</th>
                <th className="px-4 py-3 font-label-sm text-xs text-on-surface-variant font-medium">Target</th>
                <th className="px-4 py-3 font-label-sm text-xs text-on-surface-variant font-medium">IP</th>
                <th className="px-4 py-3 font-label-sm text-xs text-on-surface-variant font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center font-body-base text-sm text-on-surface-variant">
                    No audit entries match these filters yet.
                  </td>
                </tr>
              )}
              {logs.map((log: any) => {
                const isOpen = expanded === log.id;
                const hasDetail = !!(log.metadata || log.userAgent || log.targetId);
                return (
                  <React.Fragment key={log.id}>
                    <tr className="border-b border-outline-variant/10 hover:bg-surface-container/40 transition-colors">
                      <td className="px-4 py-3 font-body-base text-xs text-on-surface-variant whitespace-nowrap">
                        {formatTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-label-sm text-sm text-on-surface">
                          {log.actorEmail || <span className="text-on-surface-variant italic">anonymous</span>}
                        </div>
                        {log.actorRole && (
                          <div className="font-body-base text-[11px] text-on-surface-variant">{log.actorRole}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md border font-mono text-[11px] ${actionTone(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                        {log.status !== 'SUCCESS' && (
                          <span className="ml-2 font-label-sm text-[11px] text-error">{log.status}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-body-base text-sm text-on-surface">
                        {log.targetLabel || log.targetType || '—'}
                        {log.targetType && log.targetLabel && (
                          <span className="block font-body-base text-[11px] text-on-surface-variant">
                            {log.targetType}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant whitespace-nowrap">
                        {log.ip || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasDetail && (
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : log.id)}
                            className="material-symbols-outlined text-[18px] text-on-surface-variant hover:text-on-surface transition-colors"
                            aria-label={isOpen ? 'Hide details' : 'Show details'}
                          >
                            {isOpen ? 'expand_less' : 'expand_more'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isOpen && hasDetail && (
                      <tr className="bg-surface-container-low/40 border-b border-outline-variant/10">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-3 text-xs">
                            {log.targetId && (
                              <div>
                                <span className="text-on-surface-variant">Target ID: </span>
                                <span className="font-mono text-on-surface">{log.targetId}</span>
                              </div>
                            )}
                            {log.userAgent && (
                              <div>
                                <span className="text-on-surface-variant">User agent: </span>
                                <span className="font-mono text-on-surface break-all">{log.userAgent}</span>
                              </div>
                            )}
                            {log.metadata && (
                              <div>
                                <span className="text-on-surface-variant">Details: </span>
                                <pre className="mt-1 p-3 rounded-lg bg-surface-container-high/60 text-on-surface overflow-x-auto font-mono text-[11px] whitespace-pre-wrap break-all">
                                  {(() => {
                                    try {
                                      return JSON.stringify(JSON.parse(log.metadata), null, 2);
                                    } catch {
                                      return log.metadata;
                                    }
                                  })()}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => navigate({ action: filterAction, actor: filterActor, page: page - 1 })}
            className="px-4 py-2 rounded-lg border border-outline-variant/30 text-on-surface font-label-sm text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
          >
            Previous
          </button>
          <span className="font-body-base text-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => navigate({ action: filterAction, actor: filterActor, page: page + 1 })}
            className="px-4 py-2 rounded-lg border border-outline-variant/30 text-on-surface font-label-sm text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
