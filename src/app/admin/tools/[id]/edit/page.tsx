import { notFound } from "next/navigation";
import { ToolForm } from "@/components/admin/ToolForm";
import { getCategories, getToolByIdAdmin } from "@/app/actions/adminActions";

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ platforms, toolTypes }, tool] = await Promise.all([
    getCategories(),
    getToolByIdAdmin(id),
  ]);

  if (!tool) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
          <span>Dashboard</span>
          <span>/</span>
          <span>Tools</span>
          <span>/</span>
          <span className="text-on-surface">Edit Tool</span>
        </div>
      </div>

      <ToolForm
        initialData={tool}
        availablePlatforms={platforms.map((p) => p.name)}
        availableToolTypes={toolTypes.map((t) => t.name)}
      />
    </div>
  );
}
