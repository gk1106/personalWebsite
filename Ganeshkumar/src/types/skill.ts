export interface SkillItem {
  name: string;
  /** e.g. "planned" — for technologies presented as future direction, not current experience. */
  note?: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  items: SkillItem[];
}
