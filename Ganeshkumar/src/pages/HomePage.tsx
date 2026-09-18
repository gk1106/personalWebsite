import { Hero } from "../components/home/Hero";
import { JourneyTimeline } from "../components/home/JourneyTimeline";
import { ProjectTeasers } from "../components/home/ProjectTeasers";
import { LatestNotes } from "../components/home/LatestNotes";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function HomePage() {
  useDocumentMeta({
    title: "GaneshKumar (GK) — Java Engineer, AI Builder, Systems Thinker",
    description: "Portfolio of GaneshKumar (GK) — Java Engineer, AI Builder, Systems Thinker.",
  });

  return (
    <>
      <Hero />
      <JourneyTimeline />
      <ProjectTeasers />
      <LatestNotes />
    </>
  );
}
