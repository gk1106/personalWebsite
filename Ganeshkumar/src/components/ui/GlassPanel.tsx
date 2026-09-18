import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

interface GlassPanelProps<T extends ElementType> {
  as?: T;
  children: ReactNode;
  className?: string;
}

export function GlassPanel<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...rest
}: GlassPanelProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof GlassPanelProps<T>>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`glass rounded-panel shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
