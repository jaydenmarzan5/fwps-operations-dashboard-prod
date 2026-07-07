"use client";


import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Area, School } from "@/types/database";
import { progressPercent, sortSchoolsByProgress, statusForSchool } from "@/lib/utils";
import { Topbar } from "@/components/Topbar";
import { ProgressBar } from "@/components/ProgressBar";
import { SchoolStatus } from "@/components/SchoolStatus";
import { PageTransition } from "@/components/PageTransition";

export default function DashboardPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const [{ data: schoolsData, error: schoolsError }, { data: areasData }] = await Promise.all([
      supabase
        .from("schools")
        .select("id, name, code, area_id, total_cows, completed_cows, damaged_devices, created_at, updated_at, areas(id, name, created_at)")
        .order("name"),
      supabase.from("areas").select("id, name, created_at").order("name"),
    ]);

    if (schoolsError) console.error(schoolsError);
    setSchools((schoolsData ?? []) as unknown as School[]);
    setAreas((areasData ?? []) as Area[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("dashboard-schools")
      .on("postgres_changes", { event: "*", schema: "public", table: "schools" }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    return sortSchoolsByProgress(
      schools.filter((school) => {
        const areaMatch = selectedArea === "All Areas" || school.areas?.name === selectedArea;
        const term = search.toLowerCase();
        const searchMatch = school.name.toLowerCase().includes(term) || school.code.toLowerCase().includes(term);
        return areaMatch && searchMatch;
      })
    );
  }, [schools, selectedArea, search]);

  const totals = useMemo(() => {
    const totalSchools = filtered.length;
    const completedSchools = filtered.filter((school) => progressPercent(school) >= 100).length;
    const completedCows = filtered.reduce((sum, school) => sum + school.completed_cows, 0);
    const totalCows = filtered.reduce((sum, school) => sum + school.total_cows, 0);
    const damaged = filtered.reduce((sum, school) => sum + school.damaged_devices, 0);
    const avgProgress = totalSchools
      ? Math.round(filtered.reduce((sum, school) => sum + progressPercent(school), 0) / totalSchools)
      : 0;

    return { totalSchools, completedSchools, completedCows, totalCows, damaged, avgProgress };
  }, [filtered]);

  const lowestProgress = [...filtered].sort((a, b) => progressPercent(a) - progressPercent(b))[0];

  return (
    <PageTransition>
      <Topbar
        title="Dashboard"
        subtitle="District Chromebook Refresh"
        right={
          <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
            <option>All Areas</option>
            {areas.map((area) => (
              <option key={area.id}>{area.name}</option>
            ))}
          </select>
        }
      />

      <section className="metrics">
        <article className="card metric"><span>Schools</span><strong>{totals.totalSchools}</strong></article>
        <article className="card metric"><span>Completed</span><strong>{totals.completedSchools}</strong></article>
        <article className="card metric"><span>Avg. Progress</span><strong>{totals.avgProgress}%</strong></article>
        <article className="card metric"><span>COWs Done</span><strong>{totals.completedCows} / {totals.totalCows}</strong></article>
        <article className="card metric"><span>Damaged</span><strong>{totals.damaged}</strong></article>
      </section>

      <section className="grid">
        <div className="card panel">
          <div className="panelHead">
            <div>
              <h2>School Progress Overview</h2>
              <p className="muted">Progress across schools and areas.</p>
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school or code..." />
          </div>

          <div className="rows">
            {loading ? <div className="empty">Loading school data...</div> : null}
            {!loading && filtered.length === 0 ? <div className="empty">No schools found.</div> : null}
            {filtered.map((school) => {
              const percent = progressPercent(school);
              return (
                <div className="schoolRow" key={school.id}>
                  <div>
                    <div className="schoolName">
                      {school.name}<span className="codePill">{school.code}</span>
                    </div>
                    <div className="small">{school.areas?.name ?? "Unassigned"}</div>
                  </div>
                  <strong>{percent}%</strong>
                  <ProgressBar school={school} />
                  <div>{school.completed_cows} / {school.total_cows}</div>
                  <div>{school.damaged_devices}</div>
                  <SchoolStatus school={school} />
                </div>
              );
            })}
          </div>
        </div>

        <aside className="card panel">
          <h2>Staffing Insights</h2>
          <div className="insights">
            <div className="insight">
              <strong>{filtered.filter((s) => progressPercent(s) >= 85 && progressPercent(s) < 100).length} school(s) almost complete</strong>
              <br />
              <span className="muted">Consider reallocating support as schools approach completion.</span>
            </div>
            <div className="insight">
              <strong>{filtered.filter((s) => progressPercent(s) < 40).length} school(s) need support</strong>
              <br />
              <span className="muted">
                {lowestProgress ? `${lowestProgress.name} (${lowestProgress.code}) currently has the lowest progress.` : "No school selected."}
              </span>
            </div>
            <div className="insight">
              <strong>{selectedArea}</strong>
              <br />
              <span className="muted">{selectedArea === "All Areas" ? "District-wide view" : "Area-level view"}</span>
            </div>
          </div>
        </aside>
      </section>
    </PageTransition>
  );
}
