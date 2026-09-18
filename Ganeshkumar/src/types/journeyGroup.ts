export interface JourneyGroup {
  id: string;
  label: string;
  /** Ordered progression within this area — not a proficiency ranking. */
  steps: string[];
}
