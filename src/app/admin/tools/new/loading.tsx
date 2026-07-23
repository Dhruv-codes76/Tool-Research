import { ToolFormSkeleton } from '@/components/ui/Skeleton';

/** Loading state for the new-tool route — a ToolForm-shaped skeleton so the
 *  layout doesn't jump when the (DB-backed) categories resolve. Overrides the
 *  generic admin table skeleton for this segment. */
export default function NewToolLoading() {
  return <ToolFormSkeleton />;
}
