import { ToolFormSkeleton } from '@/components/ui/Skeleton';

/** Loading state for the edit-tool route — a ToolForm-shaped skeleton so the
 *  layout holds steady while the tool + categories load. Overrides the generic
 *  admin table skeleton for this segment. */
export default function EditToolLoading() {
  return <ToolFormSkeleton />;
}
