import { Hero } from "../components/home/Hero";
import { JourneyTimeline } from "../components/home/JourneyTimeline";
import { ProjectTeasers } from "../components/home/ProjectTeasers";

export function HomePage() {
  return (
    <>
      <Hero />
      <JourneyTimeline />
      <ProjectTeasers />
    </>
  );
}
