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
      className={`glass rounded-panel ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
