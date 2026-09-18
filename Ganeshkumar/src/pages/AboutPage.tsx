import { AboutHeader } from "../components/about/AboutHeader";
import { AboutProfile } from "../components/about/AboutProfile";
import { AboutJourney } from "../components/about/AboutJourney";
import { AboutStack } from "../components/about/AboutStack";
import { AboutExploring } from "../components/about/AboutExploring";
import { AboutProjects } from "../components/about/AboutProjects";
import { AboutContactCta } from "../components/about/AboutContactCta";
import { useScrollToHash } from "../hooks/useScrollToHash";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export function AboutPage() {
  useScrollToHash();

  useDocumentMeta({
    title: "About — GaneshKumar (GK)",
    description:
      "Java Engineer, AI Builder, Systems Thinker — background, engineering stack, and current projects.",
  });

  return (
    <>
      <AboutHeader />
      <AboutProfile />
      <AboutJourney />
      <AboutStack />
      <AboutExploring />
      <AboutProjects />
      <AboutContactCta />
    </>
  );
}
