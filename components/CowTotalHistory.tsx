

import type { CowTotalChange } from "@/types/database";
import { formatDateTime } from "@/lib/utils";

export function CowTotalHistory({ changes }: { changes: CowTotalChange[] }) {
  return (
    <>
      <h3>COW Total Change History</h3>
      <div className="notesList">
        {changes.length ? (
          changes.map((change) => (
            <div className="noteCard" key={change.id}>
              <strong>
                Total COWs changed from {change.old_total} to {change.new_total}
              </strong>
              <div>{change.reason ? `Reason: ${change.reason}` : "No reason provided."}</div>
              <div className="noteMeta">
                {change.profiles?.full_name ?? "Unknown user"} · {formatDateTime(change.created_at)}
              </div>
            </div>
          ))
        ) : (
          <div className="empty">No COW total changes recorded for this school yet.</div>
        )}
      </div>
    </>
  );
}