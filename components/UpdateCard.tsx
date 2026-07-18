import type { Update } from "@/types/database";
import { formatDateTime } from "@/lib/utils";

function updateLabel(update: Update) {
  if (update.cows_completed > 0) return "Completed COW";
  if (update.cows_completed < 0) return "Count Adjustment";
  if (update.damaged_devices > 0) return "Damaged Device";
  if (update.damaged_devices < 0) return "Damage Adjustment";
  return "General Note";
}

export function UpdateCard({ update }: { update: Update }) {
  const school = update.schools;
  const submitter = (
    update as Update & { profiles?: { full_name: string | null } | null }
  ).profiles?.full_name ?? "Unknown user";

  return (
    <div className="noteCard">
      <strong>
        {school?.name ?? "Unknown School"}
        {school?.code ? <span className="codePill">{school.code}</span> : null}
      </strong>
      <div>
        <span className="typePill">{updateLabel(update)}</span>
        {update.room_number ? <span className="roomPill">{update.room_number}</span> : null}
      </div>
      <div>{update.notes || "No note provided."}</div>
      <div className="noteMeta">
        {submitter} • {formatDateTime(update.created_at)}
      </div>
    </div>
  );
}
