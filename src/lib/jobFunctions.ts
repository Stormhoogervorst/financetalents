export const JOB_FUNCTIONS = [
  "Analyst",
  "Associate",
  "Senior Associate",
  "Vice President",
  "Director",
  "Managing Director",
  "Principal",
  "Partner",
  "Investment Manager",
  "Portfolio Manager",
  "Deal Origination",
  "M&A Advisor",
  "Equity Research Analyst",
  "Quantitative Analyst",
  "Risk Manager",
  "Compliance Officer",
  "CFO",
  "Finance Intern",
] as const;

export type JobFunction = (typeof JOB_FUNCTIONS)[number];
