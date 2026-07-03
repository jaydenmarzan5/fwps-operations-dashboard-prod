"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserProfile } from "@/lib/auth";
import type { Area, School, Update } from "@/types/database";
import { progressPercent, remainingCows, sortSchoolsByProgress } from "@/lib/utils";
import { Topbar } from "@/components/Topbar";
import { ProgressBar } from "@/components/ProgressBar";
import { SchoolStatus } from "@/components/SchoolStatus";
import { UpdateCard } from "@/components/UpdateCard";

export default function SchoolDetailPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [selectedArea, setSelectedArea] = useState("Area 4");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [editingTotalCows, setEditingTotalCows] = useState(false);
  const [totalCowsDraft, setTotalCowsDraft] = useState("");
  const [totalCowsReason, setTotalCowsReason] = useState("");
  const [savingTotalCows, setSavingTotalCows] = useState(false);
  
  async function loadData() {
    const [{ data: schoolsData }, { data: areasData }, { data: updatesData }] = await Promise.all([
      supabase.from("schools").select("*, areas(*)").order("name"),
      supabase.from("areas").select("*").order("name"),
      supabase.from("updates").select("*, schools(id, name, code, area_id)").order("created_at", { ascending: false }).limit(50),
    ]);

    setSchools((schoolsData ?? []) as School[]);
    setAreas((areasData ?? []) as Area[]);
    setUpdates((updatesData ?? []) as Update[]);
  }

  async function loadProfile() {
    const userProfile = await getCurrentUserProfile();
    setProfile(userProfile);
  }

  useEffect(() => {
    loadData();
    loadProfile();

    const channel = supabase
      .channel("school-detail")
      .on("postgres_changes", { event: "*", schema: "public", table: "schools" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "updates" }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSchools = useMemo(() => {
    return sortSchoolsByProgress(
      schools.filter((school) => {
        const areaMatch = selectedArea === "All Areas" || school.areas?.name === selectedArea;
        const term = search.toLowerCase();
        const searchMatch = school.name.toLowerCase().includes(term) || school.code.toLowerCase().includes(term);
        return areaMatch && searchMatch;
      })
    );
  }, [schools, selectedArea, search]);

  const selectedSchool = schools.find((school) => school.id === selectedSchoolId) ?? null;

  const areaStats = useMemo(() => {
    const count = filteredSchools.length;
    const avg = count ? Math.round(filteredSchools.reduce((sum, school) => sum + progressPercent(school), 0) / count) : 0;
    const completedCows = filteredSchools.reduce((sum, school) => sum + school.completed_cows, 0);
    const totalCows = filteredSchools.reduce((sum, school) => sum + school.total_cows, 0);
    const damaged = filteredSchools.reduce((sum, school) => sum + school.damaged_devices, 0);
    return { count, avg, completedCows, totalCows, damaged };
  }, [filteredSchools]);

  const schoolUpdates = selectedSchool
    ? updates.filter((update) => update.school_id === selectedSchool.id)
    : [];

  const canEditTotalCows = profile?.role === "supervisor" || profile?.role === "admin";

  function startEditingTotalCows() {
    if (!selectedSchool) return;
    setTotalCowsDraft(String(selectedSchool.total_cows));
    setTotalCowsReason("");
    setEditingTotalCows(true);
  }

  function cancelEditingTotalCows() {
    setEditingTotalCows(false);
    setTotalCowsDraft("");
    setTotalCowsReason("");
  }

  async function saveTotalCows() {
    if (!selectedSchool) return;

    const nextTotal = Number(totalCowsDraft);

    if (!Number.isInteger(nextTotal) || nextTotal < selectedSchool.completed_cows) {
      alert("Total COWs must be a whole number greater than or equal to completed COWs.");
      return;
    }

    setSavingTotalCows(true);

    const previousTotal = selectedSchool.total_cows;

    const { error: updateError } = await supabase
      .from("schools")
      .update({ total_cows: nextTotal })
      .eq("id", selectedSchool.id);

    if (updateError) {
      setSavingTotalCows(false);
      console.error(updateError);
      alert("Unable to update total COWs. Please try again.");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    const { error: logError } = await supabase
      .from("cow_total_changes")
      .insert({
        school_id: selectedSchool.id,
        changed_by: userData.user?.id ?? null,
        old_total: previousTotal,
        new_total: nextTotal,
        reason: totalCowsReason.trim() || null,
      });

    setSavingTotalCows(false);

    if (logError) {
      console.error(logError);
      alert("The COW total was updated, but the change log could not be saved.");
    }

    setSchools((currentSchools) =>
      currentSchools.map((school) =>
        school.id === selectedSchool.id ? { ...school, total_cows: nextTotal } : school
      )
    );

    setEditingTotalCows(false);
    setTotalCowsDraft("");
    setTotalCowsReason("");
  }

  return (
    <>
      <Topbar title="School Detail" subtitle="School and Area Progress" />

      <section className="detailLayout">
        <aside className="card panel">
          <div className="sidePanelControls">
            <h2>Schools</h2>
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedSchoolId(null);
              }}
            >
              <option>All Areas</option>
              {areas.map((area) => <option key={area.id}>{area.name}</option>)}
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school or code..." />
            <button className="secondaryButton" onClick={() => setSelectedSchoolId(null)}>View Area Snapshot</button>
          </div>

          <div className="schoolList">
            {filteredSchools.map((school) => (
              <button
                type="button"
                key={school.id}
                className={`schoolItem ${selectedSchool?.id === school.id ? "schoolItemActive" : ""}`}
                onClick={() => setSelectedSchoolId(school.id)}
              >
                <div className="schoolName">{school.name}<span className="codePill">{school.code}</span></div>
                <div className="small">{school.areas?.name ?? "Unassigned"} · {progressPercent(school)}% · {school.completed_cows}/{school.total_cows} COWs</div>
                <SchoolStatus school={school} />
              </button>
            ))}
          </div>
        </aside>

        <section className="card panel">
          {!selectedSchool ? (
            <>
              <h2>{selectedArea === "All Areas" ? "All Areas Snapshot" : `${selectedArea} Snapshot`}</h2>
              <div className="detailGrid">
                <div><span>Schools in View</span><strong>{areaStats.count}</strong></div>
                <div><span>Avg. Progress</span><strong>{areaStats.avg}%</strong></div>
                <div><span>COWs Completed</span><strong>{areaStats.completedCows} / {areaStats.totalCows}</strong></div>
                <div><span>Damaged Devices</span><strong>{areaStats.damaged}</strong></div>
              </div>
              <h3>Area Progress Snapshot</h3>
              <div className="snapshot">
                {filteredSchools.map((school) => (
                  <div className="snapshotRow" key={school.id}>
                    <span>{school.name}<span className="codePill">{school.code}</span></span>
                    <strong>{progressPercent(school)}%</strong>
                    <ProgressBar school={school} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="panelHead">
                <div>
                  <h2>{selectedSchool.name}<span className="codePill">{selectedSchool.code}</span></h2>
                  <p className="muted">{selectedSchool.areas?.name ?? "Unassigned"} · {selectedSchool.total_cows} COWs</p>
                </div>
                <div className="panelActions">
                  {canEditTotalCows ? (
                    <button className="secondaryButton" onClick={startEditingTotalCows}>Edit Total COWs</button>
                  ) : null}
                  <button className="secondaryButton" onClick={() => setSelectedSchoolId(null)}>Back to Area Snapshot</button>
                </div>
              </div>

              <div className="detailGrid">
                <div><span>Progress</span><strong>{progressPercent(selectedSchool)}%</strong></div>
                <div><span>COWs Completed</span><strong>{selectedSchool.completed_cows} / {selectedSchool.total_cows}</strong></div>
                <div><span>Remaining COWs</span><strong>{remainingCows(selectedSchool)}</strong></div>
                <div><span>Damaged Devices</span><strong>{selectedSchool.damaged_devices}</strong></div>
              </div>

              {editingTotalCows ? (
                <div className="cowEditCard">
                  <div>
                    <strong>Edit Total COWs</strong>
                    <p className="muted">Current total: {selectedSchool.total_cows}</p>
                  </div>
                  <input
                    type="number"
                    min={selectedSchool.completed_cows}
                    value={totalCowsDraft}
                    onChange={(e) => setTotalCowsDraft(e.target.value)}
                    aria-label="New total COW count"
                  />
                  <textarea
                    value={totalCowsReason}
                    onChange={(e) => setTotalCowsReason(e.target.value)}
                    placeholder="Reason for change (optional)"
                    aria-label="Reason for changing total COW count"
                  />
                  <div className="cowEditActions">
                    <button className="secondaryButton" onClick={cancelEditingTotalCows} disabled={savingTotalCows}>Cancel</button>
                    <button className="primaryButton" onClick={saveTotalCows} disabled={savingTotalCows}>
                      {savingTotalCows ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : null}

              <ProgressBar school={selectedSchool} large />

              <h3>Current Status</h3>
              <div className="notesList">
                <div className="noteCard">
                  <strong>{selectedSchool.completed_cows} of {selectedSchool.total_cows} COWs completed</strong>
                  <div>{remainingCows(selectedSchool)} COWs remaining. {selectedSchool.damaged_devices} damaged devices currently reported.</div>
                </div>
              </div>

              <h3>Recent Updates</h3>
              <div className="notesList">
                {schoolUpdates.length ? schoolUpdates.map((update) => <UpdateCard key={update.id} update={update} />) : <div className="empty">No updates recorded for this school yet.</div>}
              </div>
            </>
          )}
        </section>
      </section>
    </>
  );
}
