import { ToolForm } from "@/components/admin/ToolForm";

export default function NewToolPage() {
  return (
    <div className="flex flex-col gap-8 pb-20">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
          <span>Dashboard</span>
          <span>/</span>
          <span>Tools</span>
          <span>/</span>
          <span className="text-on-surface">New Tool</span>
        </div>
      </div>
      
      <ToolForm />
    </div>
  );
}
