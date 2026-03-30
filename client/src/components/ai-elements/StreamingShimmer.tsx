function ShimmerLine({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-3 rounded bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse"
      style={{ width }}
    />
  );
}

export function StreamingShimmer() {
  return (
    <div className="space-y-2 py-1">
      <ShimmerLine width="90%" />
      <ShimmerLine width="75%" />
      <ShimmerLine width="60%" />
    </div>
  );
}
