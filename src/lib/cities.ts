export const CITIES = [
  "amsterdam",
  "rotterdam",
  "utrecht",
  "den-haag",
  "eindhoven",
  "groningen",
  "tilburg",
  "breda",
  "nijmegen",
  "enschede",
  "arnhem",
  "den-bosch",
  "maastricht",
  "leiden",
] as const;

export type CitySlug = (typeof CITIES)[number];

const DISPLAY_NAMES: Record<string, string> = {
  "den-haag": "Den Haag",
  "den-bosch": "Den Bosch",
};

export function cityDisplayName(slug: string): string {
  if (DISPLAY_NAMES[slug]) return DISPLAY_NAMES[slug];
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function isValidCity(slug: string): slug is CitySlug {
  return (CITIES as readonly string[]).includes(slug);
}

export function cityLocationFilter(slug: string): string {
  const name = DISPLAY_NAMES[slug] ?? slug;
  return `%${name}%`;
}
