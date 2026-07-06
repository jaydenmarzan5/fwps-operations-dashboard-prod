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

  useEffect(() => {
    async function checkAdmin() {
      const userProfile = await getCurrentUserProfile();

      if (!userProfile || userProfile.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

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
              <button className="secondaryButton" onClick={() => openEditProfile(profile)}>
                Edit
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card panel">
        <h2>System Actions</h2>
        <p className="muted">Reset dashboard data before a pilot or refresh cycle.</p>
        <div className="empty">Reset tools coming next.</div>
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
    </PageTransition>
  );
}