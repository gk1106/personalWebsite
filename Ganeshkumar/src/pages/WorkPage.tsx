import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { GlassPanel } from "../components/ui/GlassPanel";
import { projects } from "../data/projects";

export function WorkPage() {
  return (
    <Container className="flex flex-col gap-10 py-24">
      <SectionHeading
        eyebrow="Selected work"
        title="Projects"
        description="Full write-ups are in progress. Placeholder entries below reflect confirmed project names only."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <GlassPanel key={project.id} className="flex flex-col gap-2 p-6">
            <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
            <p className="text-sm text-muted-foreground">{project.summary}</p>
          </GlassPanel>
        ))}
      </div>
    </Container>
  );
}
