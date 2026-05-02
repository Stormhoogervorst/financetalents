export const JOB_FUNCTIONS = [
  "Advocaat",
  "Kandidaat-notaris",
  "Notaris",
  "Jurist",
  "Juridisch medewerker",
  "Juridisch adviseur",
  "Bedrijfsjurist",
  "Legal counsel",
  "Fiscalist",
  "Paralegal",
  "Compliance officer",
  "Mediator",
  "Griffier",
  "Curator",
  "Belastingadviseur",
] as const;

export type JobFunction = (typeof JOB_FUNCTIONS)[number];
