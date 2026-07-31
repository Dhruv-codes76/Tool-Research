import { ToolForm } from "@/components/admin/ToolForm";
import { getCategories } from "@/app/actions/adminActions";

export default async function NewToolPage({
  searchParams,
}: {
  searchParams: Promise<{ sourceType?: string }>;
}) {
  const { sourceType } = await searchParams;
  const { platforms, toolTypes } = await getCategories();

  const isProprietary = sourceType?.toUpperCase() === "PROPRIETARY";

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
          <span>Dashboard</span>
          <span>/</span>
          <span>Tools</span>
          <span>/</span>
          <span className="text-on-surface">
            {isProprietary ? "New Proprietary Tool" : "New Open Source Tool"}
          </span>
        </div>
      </div>
      
      <ToolForm
        initialSourceType={isProprietary ? "PROPRIETARY" : "OPEN_SOURCE"}
        availablePlatforms={platforms.map((p: { name: string }) => p.name)}
        availableToolTypes={toolTypes.map((t: { name: string }) => t.name)}
      />
    </div>
  );
}
