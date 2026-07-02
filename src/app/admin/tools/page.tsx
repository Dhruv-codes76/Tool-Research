import React from 'react';
import Link from 'next/link';
import { getAdminStats, getAllToolsAdmin } from '@/app/actions/adminActions';
import { Tool, Platform, ToolType } from '@prisma/client';
import { DeleteToolButton } from '@/components/admin/DeleteToolButton';
import { RestoreToolButton } from '@/components/admin/RestoreToolButton';

type ToolWithCategories = Tool & { platforms: Platform[], toolTypes: ToolType[] };
export default async function ManageToolsPage() {
  const stats = await getAdminStats();
  const tools = (await getAllToolsAdmin()) as ToolWithCategories[];

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-on-surface">Tools</span>
          </div>
          <h1 className="font-display-lg text-3xl font-bold text-on-surface tracking-tight mb-1">Manage Tools</h1>
          <p className="font-body-base text-sm text-on-surface-variant">Curate and oversee the open-source repository ecosystem.</p>
        </div>
        
        <Link 
          href="/admin/tools/new" 
          className="bg-primary-container text-on-primary-container hover:bg-primary transition-colors flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-label-sm text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Tool
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
          <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">Total Tools</p>
          <p className="font-display-lg text-4xl text-on-surface">{stats.total.toLocaleString()}</p>
          <p className="font-body-base text-[11px] text-[#22D3EE]">↑ 12% this month</p>
        </div>
        
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
          <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">Active Tools</p>
          <p className="font-display-lg text-4xl text-on-surface">{stats.active.toLocaleString()}</p>
          <p className="font-body-base text-[11px] text-on-surface-variant">89.4% uptime</p>
        </div>
        
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
          <p className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">Pending Submissions</p>
          <p className="font-display-lg text-4xl text-on-surface">{stats.pending.toLocaleString()}</p>
          <p className="font-body-base text-[11px] text-[#FBBF24]">⚠️ Awaiting review</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">Tool Name</th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">Category</th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">Repo Stars</th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal">Status</th>
                <th className="px-6 py-4 font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {tools.map((tool) => (
                <tr key={tool.id} className="hover:bg-surface-container-high/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-surface-container flex items-center justify-center border border-outline-variant/20">
                        {tool.imageUrl ? (
                          <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-cover rounded-md opacity-80" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">code</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-sm text-on-surface">{tool.name}</span>
                        <span className="font-body-base text-[11px] text-on-surface-variant mt-0.5 truncate max-w-[200px]">
                          {tool.repoUrl.replace('https://github.com/', '')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {tool.platforms.slice(0, 2).map((p) => (
                        <span key={p.id} className="px-2 py-1 bg-surface-container rounded-full font-label-sm text-[9px] text-on-surface uppercase tracking-wider border border-outline-variant/20">
                          {p.name}
                        </span>
                      ))}
                      {tool.platforms.length > 2 && (
                        <span className="px-2 py-1 bg-surface-container rounded-full font-label-sm text-[9px] text-on-surface uppercase tracking-wider border border-outline-variant/20">
                          +{tool.platforms.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-on-surface font-mono-code text-[13px]">
                      <span className="material-symbols-outlined text-[14px] text-[#FBBF24]">star</span>
                      {(tool.stars / 1000).toFixed(1)}k
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-label-sm text-xs">
                      {tool.status === 'ACTIVE' ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                          <span className="text-[#10B981]">Live</span>
                        </>
                      ) : tool.status === 'DRAFT' ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span>
                          <span className="text-[#FBBF24]">Draft</span>
                        </>
                      ) : tool.status === 'DELETED' ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-error"></span>
                          <span className="text-error">Deleted</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                          <span className="text-on-surface-variant capitalize">{tool.status.toLowerCase()}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-on-surface-variant">
                      <Link href={`/admin/tools/${tool.id}/edit`} className="p-1.5 hover:text-primary transition-colors hover:bg-surface-container rounded-md">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </Link>
                      {tool.status === 'DELETED' ? (
                        <RestoreToolButton toolId={tool.id} toolName={tool.name} />
                      ) : (
                        <DeleteToolButton toolId={tool.id} toolName={tool.name} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {tools.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant font-body-base text-sm">
                    No tools found. Click "Add Tool" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-between">
          <span className="font-body-base text-[11px] text-on-surface-variant">
            Showing {tools.length} of {stats.total} tools
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 font-label-sm text-[11px] text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 font-label-sm text-[11px] bg-surface-container text-on-surface rounded-md hover:bg-surface-container-high transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
