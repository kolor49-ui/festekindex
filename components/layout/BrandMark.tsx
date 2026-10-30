/**
 * V3 modular bevel — 2×2 colour fields (red · yellow · green · blue).
 * No outer frame; engineering mark for FESTÉKINDEX.
 */
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
