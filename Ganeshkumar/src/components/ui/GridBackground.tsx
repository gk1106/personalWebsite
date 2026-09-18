/**
 * Fixed, decorative backdrop: near-black base + faint technical grid + two
 * static, low-opacity glows. No animation — kept deliberately restrained.
 */
export function GridBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid" />
      <div className="glow-primary absolute -top-32 left-[10%] h-[28rem] w-[28rem] rounded-full blur-3xl" />
      <div className="glow-secondary absolute bottom-[-8rem] right-[5%] h-[26rem] w-[26rem] rounded-full blur-3xl" />
    </div>
  );
}
