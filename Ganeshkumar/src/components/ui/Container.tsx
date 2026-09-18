import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";

interface ContainerProps<T extends ElementType> {
  as?: T;
  children: ReactNode;
  className?: string;
}

export function Container<T extends ElementType = "div">({
  as,
  children,
  className = "",
  ...rest
}: ContainerProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ContainerProps<T>>) {
  const Component = as ?? "div";

  return (
    <Component
      className={`mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
