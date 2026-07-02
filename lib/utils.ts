import type { School } from "@/types/database";

export function progressPercent(school: School) {
  if (!school.total_cows) return 0;
  return Math.min(100, Math.round((school.completed_cows / school.total_cows) * 100));
}

export function statusForSchool(school: School) {
  const percent = progressPercent(school);
  if (percent >= 100) return { label: "Complete", className: "statusComplete", color: "var(--blue)" };
  if (percent >= 85) return { label: "Almost Complete", className: "statusGood", color: "var(--green)" };
  if (percent >= 45) return { label: "In Progress", className: "statusMid", color: "var(--yellow)" };
  return { label: "Needs Support", className: "statusBad", color: "var(--red)" };
}

export function sortSchoolsByProgress(schools: School[]) {
  return [...schools].sort((a, b) => {
    const diff = progressPercent(b) - progressPercent(a);
    return diff || a.name.localeCompare(b.name);
  });
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function remainingCows(school: School) {
  return Math.max(0, school.total_cows - school.completed_cows);
}
