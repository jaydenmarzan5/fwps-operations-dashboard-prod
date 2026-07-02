import type { School } from "@/types/database";
import { progressPercent, statusForSchool } from "@/lib/utils";

export function ProgressBar({ school, large = false }: { school: School; large?: boolean }) {
  const percent = progressPercent(school);
  const status = statusForSchool(school);

  return (
    <div className={large ? "progressLarge" : "progress"}>
      <div style={{ width: `${percent}%`, background: status.color }} />
    </div>
  );
}
