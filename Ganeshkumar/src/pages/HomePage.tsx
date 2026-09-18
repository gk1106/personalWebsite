import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ProfileImage } from "../components/ui/ProfileImage";

// Placeholder only — the full narrative home page is built in a later phase.
export function HomePage() {
  return (
    <Container className="flex flex-col items-center gap-8 py-24 text-center">
      <ProfileImage />
      <SectionHeading
        align="center"
        eyebrow="GaneshKumar"
        title="Home page under construction"
        description="Foundation phase — layout, tokens, and routing are wired up. The full narrative home page comes next."
      />
    </Container>
  );
}
