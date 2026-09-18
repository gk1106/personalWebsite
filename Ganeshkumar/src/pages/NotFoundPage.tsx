import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <Container className="flex flex-col items-center gap-6 py-32 text-center">
      <SectionHeading align="center" eyebrow="404" title="Page not found" />
      <Button to="/">Back home</Button>
    </Container>
  );
}
