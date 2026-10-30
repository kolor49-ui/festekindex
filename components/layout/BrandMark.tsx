/** C1 light — 2×2 colour palette mark (red · yellow · green · blue). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={`brand-mark${className ? ` ${className}` : ""}`}
      aria-hidden
    >
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
