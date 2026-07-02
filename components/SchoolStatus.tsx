import type { School } from "@/types/database";
import { statusForSchool } from "@/lib/utils";

export function SchoolStatus({ school }: { school: School }) {
  const status = statusForSchool(school);
  return <span className={`badge ${status.className}`}>{status.label}</span>;
}
