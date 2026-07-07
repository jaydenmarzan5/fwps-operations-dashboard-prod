"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Area, School, Update } from "@/types/database";
import { progressPercent, sortSchoolsByProgress } from "@/lib/utils";
import { Topbar } from "@/components/Topbar";
import { UpdateCard } from "@/components/UpdateCard";
import { PageTransition } from "@/components/PageTransition";

const updateTypes = ["All Updates", "Completed COW", "Damaged Device", "General Note"];

function labelForUpdate(update: Update) {
  if (update.cows_completed !== 0) return "Completed COW";
  if (update.damaged_devices !== 0) return "Damaged Device";
  return "General Note";
}

export default function SummaryPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedSchoolId, setSelectedSchoolId] = useState("All Schools");
  const [selectedType, setSelectedType] = useState("All Updates");
  const [search, setSearch] = useState("");

  async function loadData() {
    const [{ data: schoolsData }, { data: areasData }, { data: updatesData }] = await Promise.all([
      supabase
        .from("schools")
        .select("id, name, code, area_id, total_cows, completed_cows, damaged_devices, updated_at, areas(id, name)")
        .order("name"),
      supabase.from("areas").select("id, name").order("name"),
      supabase
        .from("updates")
        .select("id, school_id, user_id, cows_completed, damaged_devices, room_number, notes, created_at, schools(id, name, code, area_id)")
        .order("created_at", { ascending: false }),
    ]);

    setSchools((schoolsData ?? []) as unknown as School[]);
    setAreas((areasData ?? []) as unknown as Area[]);
    setUpdates((updatesData ?? []) as unknown as Update[]);
  }

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("summary")
      .on("postgres_changes", { event: "*", schema: "public", table: "schools" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "updates" }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSchools = useMemo(() => {
    return sortSchoolsByProgress(
      schools.filter((school) => selectedArea === "All Areas" || school.areas?.name === selectedArea)
    );
  }, [schools, selectedArea]);

  const visibleSchools = useMemo(() => {
    if (selectedSchoolId === "All Schools") return filteredSchools;
    return filteredSchools.filter((school) => school.id === selectedSchoolId);
  }, [filteredSchools, selectedSchoolId]);

  const visibleUpdates = useMemo(() => {
    const visibleSchoolIds = new Set(visibleSchools.map((school) => school.id));
    const term = search.toLowerCase();

    return updates.filter((update) => {
      const school = update.schools;
      const typeMatch = selectedType === "All Updates" || labelForUpdate(update) === selectedType;
      const schoolMatch = update.school_id ? visibleSchoolIds.has(update.school_id) : false;
      const searchMatch =
        !term ||
        school?.name.toLowerCase().includes(term) ||
        school?.code.toLowerCase().includes(term) ||
        update.room_number?.toLowerCase().includes(term) ||
        update.notes?.toLowerCase().includes(term);

      return typeMatch && schoolMatch && searchMatch;
    });
  }, [updates, visibleSchools, selectedType, search]);

  const totals = useMemo(() => {
    const count = visibleSchools.length;
    const completedCows = visibleSchools.reduce((sum, school) => sum + school.completed_cows, 0);
    const totalCows = visibleSchools.reduce((sum, school) => sum + school.total_cows, 0);
    const damaged = visibleSchools.reduce((sum, school) => sum + school.damaged_devices, 0);
    const avg = count ? Math.round(visibleSchools.reduce((sum, school) => sum + progressPercent(school), 0) / count) : 0;
    const completeSchools = visibleSchools.filter((school) => progressPercent(school) >= 100).length;
    return { count, completedCows, totalCows, damaged, avg, completeSchools };
  }, [visibleSchools]);

  return (
    <PageTransition>
      <Topbar title="End-of-Day Summary" subtitle="Daily Progress and Updates" />

      <section className="card panel summary">
        <div className="summaryControls">
          <select value={selectedArea} onChange={(e) => { setSelectedArea(e.target.value); setSelectedSchoolId("All Schools"); }}>
            <option>All Areas</option>
            {areas.map((area) => <option key={area.id}>{area.name}</option>)}
          </select>

          <select value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)}>
            <option>All Schools</option>
            {filteredSchools.map((school) => <option key={school.id} value={school.id}>{school.name} ({school.code})</option>)}
          </select>

          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {updateTypes.map((type) => <option key={type}>{type}</option>)}
          </select>

          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school, code, room, or note..." />
        </div>

        <div className="summaryCard">
          <strong>{selectedSchoolId === "All Schools" ? "Summary" : "School Summary"}</strong>
          <br />
          Area view: {selectedArea}
          <br />
          Schools shown: {totals.count}
          <br />
          COWs completed: {totals.completedCows} / {totals.totalCows}
          <br />
          Average progress: {totals.avg}%
          <br />
          Damaged devices found: {totals.damaged}
          <br />
          Schools completed: {totals.completeSchools}
        </div>

        <div className="notesSection">
          <h3>Updates</h3>
          <div className="notesList">
            {visibleUpdates.length ? visibleUpdates.map((update) => <UpdateCard key={update.id} update={update} />) : <div className="empty">No updates match the current filters.</div>}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
