import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ProjectCaseStudy } from "../components/work/ProjectCaseStudy";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { projects } from "../data/projects";

export function WorkPage() {
  useScrollToHash();

  useDocumentMeta({
    title: "Work — GaneshKumar (GK)",
    description:
      "Selected engineering projects by GaneshKumar (GK): InsuranceAI Agent, Jansamarth, and InsuranceHub.",
  });

  return (
    <>
      <Container className="flex flex-col gap-6 pt-20 lg:pt-28">
        <SectionHeading
          level="h1"
          eyebrow="Selected work"
          title="Things I've built."
          description="From enterprise applications to AI-powered insurance workflows."
        />
      </Container>

      <div className="flex flex-col divide-y divide-border">
        {projects.map((project, index) => (
          <ProjectCaseStudy key={project.id} project={project} index={index} />
        ))}
      </div>
    </>
  );
}
