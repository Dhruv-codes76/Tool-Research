"use client";

import { useTransition } from "react";
import { deleteTool } from "@/app/actions/adminActions";

export function DeleteToolButton({ toolId, toolName }: { toolId: string, toolName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${toolName}?`)) {
      startTransition(async () => {
        try {
          await deleteTool(toolId);
        } catch (error: any) {
          alert(error.message || "Failed to delete tool.");
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 hover:text-error transition-colors hover:bg-surface-container rounded-md disabled:opacity-50"
      title="Delete tool"
    >
      <span className="material-symbols-outlined text-[18px]">
        {isPending ? 'hourglass_empty' : 'delete'}
      </span>
    </button>
  );
}
