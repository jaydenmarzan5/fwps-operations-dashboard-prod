"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Area, School } from "@/types/database";
import { Topbar } from "@/components/Topbar";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence, motion } from "framer-motion";

type PendingAction = {
  school: School;
  field: "completed_cows" | "damaged_devices";
  amount: number;
  label: string;
};

export default function InternUpdatePage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedArea, setSelectedArea] = useState("Area 4");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [room, setRoom] = useState("");
  const [confirmNote, setConfirmNote] = useState("");
  const [manualRoom, setManualRoom] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [showToast, setShowToast] = useState(false);

  async function loadData() {
    const [{ data: schoolsData }, { data: areasData }] = await Promise.all([
      supabase
        .from("schools")
        .select("id, name, code, area_id, total_cows, completed_cows, damaged_devices, updated_at, areas(id, name)")
        .order("name"),
      supabase.from("areas").select("id, name").order("name"),
    ]);

    setSchools((schoolsData ?? []) as unknown as School[]);
    setAreas((areasData ?? []) as unknown as Area[]);
  }

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel("intern-update")
      .on("postgres_changes", { event: "*", schema: "public", table: "schools" }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => selectedArea === "All Areas" || school.areas?.name === selectedArea);
  }, [schools, selectedArea]);

  useEffect(() => {
    if (!selectedSchoolId && filteredSchools[0]) setSelectedSchoolId(filteredSchools[0].id);
  }, [filteredSchools, selectedSchoolId]);

  const selectedSchool = schools.find((school) => school.id === selectedSchoolId);

  function openConfirm(action: Omit<PendingAction, "school">) {
    if (!selectedSchool) return;
    setPendingAction({ ...action, school: selectedSchool });
    setRoom("");
    setConfirmNote("");
  }

  async function saveConfirmedUpdate() {
    if (!pendingAction) return;

    const { school, field, amount } = pendingAction;
    const nextValue = Math.max(0, field === "completed_cows"
      ? Math.min(school.total_cows, school.completed_cows + amount)
      : school.damaged_devices + amount
    );

    const { error: schoolError } = await supabase
      .from("schools")
      .update({ [field]: nextValue, updated_at: new Date().toISOString() })
      .eq("id", school.id);

    if (schoolError) {
      alert(schoolError.message);
      return;
    }

    const { error: updateError } = await supabase.from("updates").insert({
      school_id: school.id,
      cows_completed: field === "completed_cows" ? amount : 0,
      damaged_devices: field === "damaged_devices" ? amount : 0,
      room_number: room || null,
      notes: confirmNote || pendingAction.label,
    });

    if (updateError) {
      alert(updateError.message);
      return;
    }

    setPendingAction(null);
    await loadData();
    triggerToast();
  }

  async function saveManualNote() {
    if (!selectedSchool || !manualNote.trim()) return;

    const { error } = await supabase.from("updates").insert({
      school_id: selectedSchool.id,
      cows_completed: 0,
      damaged_devices: 0,
      room_number: manualRoom || null,
      notes: manualNote,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setManualRoom("");
    setManualNote("");
    await loadData();
    triggerToast();
  }

  function triggerToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  return (
    <PageTransition>
      <Topbar title="Intern Update" subtitle="Field Progress Updates" />

      <section className="phoneWrap">
        <div className="phone">
          <h2>Update Progress</h2>

          <label>
            Area
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedSchoolId("");
              }}
            >
              <option>All Areas</option>
              {areas.map((area) => <option key={area.id}>{area.name}</option>)}
            </select>
          </label>

          <label>
            School
            <select value={selectedSchoolId} onChange={(e) => setSelectedSchoolId(e.target.value)}>
              {filteredSchools.map((school) => (
                <option key={school.id} value={school.id}>{school.name} ({school.code})</option>
              ))}
            </select>
          </label>

          <div className="mobileStat"><span>COWs Completed</span><strong>{selectedSchool ? `${selectedSchool.completed_cows} / ${selectedSchool.total_cows}` : "0 / 0"}</strong></div>
          <div className="buttonRow">
            <button onClick={() => openConfirm({ field: "completed_cows", amount: -1, label: "-1 completed COW" })}>-1 COW</button>
            <button onClick={() => openConfirm({ field: "completed_cows", amount: 1, label: "+1 completed COW" })}>+1 COW</button>
          </div>

          <div className="mobileStat"><span>Damaged Devices</span><strong>{selectedSchool?.damaged_devices ?? 0}</strong></div>
          <div className="buttonRow">
            <button onClick={() => openConfirm({ field: "damaged_devices", amount: -1, label: "-1 damaged device" })}>-1 Damaged</button>
            <button onClick={() => openConfirm({ field: "damaged_devices", amount: 1, label: "+1 damaged device" })}>+1 Damaged</button>
          </div>

          <div className="divider" />

          <h3>General / Room Note</h3>
          <label>
            Room / Location
            <input value={manualRoom} onChange={(e) => setManualRoom(e.target.value)} placeholder="Room 214, Library, Media Center" />
          </label>
          <label>
            Team Note
            <textarea value={manualNote} onChange={(e) => setManualNote(e.target.value)} placeholder="Enter progress note..." />
          </label>
          <button className="primaryButton" onClick={saveManualNote}>Save Note</button>
        </div>

        <div className="card panel">
          <h2>Current School</h2>
          {selectedSchool ? (
            <>
              <p><strong>{selectedSchool.name}</strong> <span className="codePill">{selectedSchool.code}</span></p>
              <p className="muted">{selectedSchool.areas?.name ?? "Unassigned"}</p>
              <div className="detailGrid">
                <div><span>Total COWs</span><strong>{selectedSchool.total_cows}</strong></div>
                <div><span>Completed</span><strong>{selectedSchool.completed_cows}</strong></div>
                <div><span>Damaged</span><strong>{selectedSchool.damaged_devices}</strong></div>
                <div><span>Remaining</span><strong>{Math.max(0, selectedSchool.total_cows - selectedSchool.completed_cows)}</strong></div>
              </div>
            </>
          ) : (
            <div className="empty">Select a school to begin.</div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {pendingAction ? (
          <motion.div
            className="modalOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="modal"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
            <h2>Confirm Update</h2>
            <p className="muted">Apply <strong>{pendingAction.label}</strong> to <strong>{pendingAction.school.name} ({pendingAction.school.code})</strong>?</p>
            <label>
              Room / Location
              <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room 214, Library, Media Center" />
            </label>
            <label>
              Optional Note
              <textarea value={confirmNote} onChange={(e) => setConfirmNote(e.target.value)} placeholder="Add any additional context..." />
            </label>
            <div className="modalActions">
              <button className="secondaryButton" onClick={() => setPendingAction(null)}>Cancel</button>
              <button className="primaryButton" onClick={saveConfirmedUpdate}>Confirm Update</button>
            </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showToast ? (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="checkmark">✓</div>
            <div>
              <strong>Updates saved</strong>
              <div className="muted">Dashboard data has been updated.</div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageTransition>
  );
}
