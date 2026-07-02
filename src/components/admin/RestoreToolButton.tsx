"use client";

import { useTransition } from "react";
import { restoreTool } from "@/app/actions/adminActions";

export function RestoreToolButton({ toolId, toolName }: { toolId: string, toolName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    if (confirm(`Are you sure you want to restore ${toolName}? It will be restored as a Draft.`)) {
      startTransition(async () => {
        try {
          await restoreTool(toolId);
        } catch (error: any) {
          alert(error.message || "Failed to restore tool.");
        }
      });
    }
  };

  return (
    <button 
      onClick={handleRestore}
      disabled={isPending}
      className="p-1.5 hover:text-[#10B981] transition-colors hover:bg-surface-container rounded-md disabled:opacity-50"
      title="Restore tool"
    >
      <span className="material-symbols-outlined text-[18px]">
        {isPending ? 'hourglass_empty' : 'restore'}
      </span>
    </button>
  );
}
