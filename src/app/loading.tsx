export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-2 border-outline-variant/30 border-t-primary animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
