import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";

export function AboutPage() {
  return (
    <Container className="flex flex-col gap-6 py-24">
      <SectionHeading
        eyebrow="About"
        title="Java Engineer / AI Builder / Systems Thinker"
        description="Full bio and engineering narrative are written in a later phase."
      />
    </Container>
  );
}
