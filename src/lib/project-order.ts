type DatedProject = { projectDate: string | null };

// Partial dates retain their precision. A year-only date follows dated entries
// in the same year; unknown dates follow all known project dates.
function dateKey(value: string | null): number {
  if (!value) return 0;
  const [year, month = 0, day = 0] = value.split("-").map(Number);
  return year * 10000 + month * 100 + day;
}

export function compareProjectDates(a: DatedProject, b: DatedProject): number {
  return dateKey(b.projectDate) - dateKey(a.projectDate);
}

export function sortProjects<T extends DatedProject & { id: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => compareProjectDates(a, b) || a.id.localeCompare(b.id));
}

export function sortProjectPosts<T extends DatedProject & { project: string; slug: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => compareProjectDates(a, b) || a.project.localeCompare(b.project) || a.slug.localeCompare(b.slug));
}
