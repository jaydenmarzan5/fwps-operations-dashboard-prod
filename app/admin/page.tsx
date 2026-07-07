"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUserProfile } from "@/lib/auth";
import { PageTransition } from "@/components/PageTransition";
import { Topbar } from "@/components/Topbar";
import { AnimatePresence, motion } from "framer-motion";

type Profile = {
  id: string;
  full_name: string | null;
  role: "intern" | "supervisor" | "admin";
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [roleDraft, setRoleDraft] = useState<Profile["role"]>("intern");
  const [savingRole, setSavingRole] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [resettingDashboard, setResettingDashboard] = useState(false);

  async function loadProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProfiles((data ?? []) as Profile[]);
  }

  function openEditProfile(profile: Profile) {
    setEditingProfile(profile);
    setRoleDraft(profile.role);
  }

  async function saveRoleChange() {
    if (!editingProfile) return;

    if (currentProfile?.id === editingProfile.id && roleDraft !== "admin") {
      alert("You cannot remove your own admin access.");
      return;
    }

    setSavingRole(true);

    const { error } = await supabase
      .from("profiles")
      .update({ role: roleDraft })
      .eq("id", editingProfile.id);

    setSavingRole(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setProfiles((currentProfiles) =>
      currentProfiles.map((profile) =>
        profile.id === editingProfile.id ? { ...profile, role: roleDraft } : profile
      )
    );

    setEditingProfile(null);
  }

  async function resetDashboard() {
    if (resetConfirmation !== "RESET") return;

    setResettingDashboard(true);

    const { error: updatesError } = await supabase.from("updates").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    if (updatesError) {
      setResettingDashboard(false);
      console.error(updatesError);
      alert(updatesError.message);
      return;
    }

    const { error: cowHistoryError } = await supabase
      .from("cow_total_changes")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (cowHistoryError) {
      setResettingDashboard(false);
      console.error(cowHistoryError);
      alert(cowHistoryError.message);
      return;
    }

    const { error: schoolsError } = await supabase
      .from("schools")
      .update({ completed_cows: 0, damaged_devices: 0 })
      .neq("id", "00000000-0000-0000-0000-000000000000");

    setResettingDashboard(false);

    if (schoolsError) {
      console.error(schoolsError);
      alert(schoolsError.message);
      return;
    }

    setShowResetModal(false);
    setResetConfirmation("");
    alert("Dashboard reset complete.");
  }

  useEffect(() => {
    async function checkAdmin() {
      const userProfile = await getCurrentUserProfile();

      if (!userProfile || userProfile.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setCurrentProfile(userProfile as Profile);
      await loadProfiles();
      setChecking(false);
    }

    checkAdmin();
  }, [router]);

  if (checking) {
    return <main className="main">Checking admin access...</main>;
  }

  return (
    <PageTransition>
      <Topbar title="Admin" subtitle="Manage users and system actions" />

      <section className="card panel">
        <div className="panelHead">
          <div>
            <h2>User Management</h2>
            <p className="muted">View users and roles in the dashboard.</p>
          </div>
          <button className="primaryButton">+ Add User</button>
        </div>

        <div className="adminTable">
          <div className="adminTableHeader">
            <span>Name</span>
            <span>Role</span>
            <span>Created</span>
            <span>Actions</span>
          </div>

          {profiles.map((profile) => (
            <div className="adminTableRow" key={profile.id}>
              <strong>{profile.full_name ?? "Unnamed User"}</strong>
              <span className={`roleBadge role-${profile.role}`}>{profile.role}</span>
              <span>{new Date(profile.created_at).toLocaleDateString()}</span>
              <button
                className="secondaryButton"
                onClick={() => openEditProfile(profile)}
                disabled={currentProfile?.id === profile.id}
                title={currentProfile?.id === profile.id ? "You cannot edit your own admin role." : "Edit user role"}
              >
                {currentProfile?.id === profile.id ? "Current User" : "Edit"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card panel">
        <h2>System Actions</h2>
        <p className="muted">Reset dashboard data before a pilot or refresh cycle.</p>

        <div className="adminActionCard">
          <div>
            <strong>Reset Dashboard</strong>
            <p className="muted">
              Clears intern updates and audit history, then resets completed COWs and damaged device counts to 0.
              Schools, users, roles, and total COW counts are preserved.
            </p>
          </div>
          <button className="dangerButton" onClick={() => setShowResetModal(true)}>
            Reset Dashboard
          </button>
        </div>
      </section>

      <AnimatePresence>
        {editingProfile ? (
          <motion.div
            className="modalOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="modal adminEditModal"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div>
                <h2>Edit User</h2>
                <p className="muted">{editingProfile.full_name ?? "Unnamed User"}</p>
              </div>

              <label>
                Role
                <select value={roleDraft} onChange={(e) => setRoleDraft(e.target.value as Profile["role"])}>
                  <option value="intern">Intern</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <div className="modalActions">
                <button className="secondaryButton" onClick={() => setEditingProfile(null)} disabled={savingRole}>
                  Cancel
                </button>
                <button className="primaryButton" onClick={saveRoleChange} disabled={savingRole}>
                  {savingRole ? "Saving..." : "Save Role"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showResetModal ? (
          <motion.div
            className="modalOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="modal adminEditModal"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div>
                <h2>Reset Dashboard</h2>
                <p className="muted">
                  This will delete all intern updates and COW total audit history. It will also reset completed COWs
                  and damaged device counts to 0. Schools, users, roles, and total COW counts will not be changed.
                </p>
              </div>

              <label>
                Type RESET to confirm
                <input
                  value={resetConfirmation}
                  onChange={(e) => setResetConfirmation(e.target.value)}
                  placeholder="RESET"
                />
              </label>

              <div className="modalActions">
                <button
                  className="secondaryButton"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetConfirmation("");
                  }}
                  disabled={resettingDashboard}
                >
                  Cancel
                </button>
                <button
                  className="dangerButton"
                  onClick={resetDashboard}
                  disabled={resetConfirmation !== "RESET" || resettingDashboard}
                >
                  {resettingDashboard ? "Resetting..." : "Reset Dashboard"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageTransition>
  );
}