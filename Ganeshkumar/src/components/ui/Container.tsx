import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

interface ContainerProps<T extends ElementType> {
  as?: T;
  /** Use the narrower reading-width variant (e.g. article body copy). */
  narrow?: boolean;
  children: ReactNode;
  className?: string;
}

export function Container<T extends ElementType = "div">({
  as,
  narrow = false,
  children,
  className = "",
  ...rest
}: ContainerProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ContainerProps<T>>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`mx-auto w-full ${narrow ? "max-w-3xl" : "max-w-6xl"} px-5 sm:px-8 lg:px-10 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
