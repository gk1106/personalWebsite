import type { ReactNode } from "react";
import { Container } from "../ui/Container";
import { BackToBlog } from "./BackToBlog";

interface ArticleLayoutProps {
  children: ReactNode;
}

export function ArticleLayout({ children }: ArticleLayoutProps) {
  return (
    <article className="py-20 lg:py-28">
      <Container narrow>
        <BackToBlog />
        <div className="mt-10 flex flex-col gap-12">{children}</div>
      </Container>
    </article>
  );
}
