"use client";

import { getCurrentUserProfile } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, Building2, ClipboardList, FileText, LogOut, ShieldCheck } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";
  const [checkingAuth, setCheckingAuth] = useState(!isLoginPage);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function protectRoute() {
      if (isLoginPage) {
        setCheckingAuth(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
        return;
      }

      const userProfile = await getCurrentUserProfile();
      setProfile(userProfile);

      setCheckingAuth(false);
    }

    protectRoute();

  }, [isLoginPage, router]);

  if (checkingAuth) {
    return <main className="main">Loading...</main>;
  }

  if (isLoginPage) {
    return <main>{children}</main>;
  }

  async function handleSignOut() {
    const confirmed = window.confirm("Are you sure you want to sign out?");

    if (!confirmed) return;

    await supabase.auth.signOut();
    router.replace("/login");
  }
  
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandLogoWrap">
            <Image src="/fwps-logo.png" alt="FWPS logo" width={42} height={42} className="brandLogo" />
          </div>
          <div>
            <h2>FWPS Refresh</h2>
            <p>Operations Dashboard</p>
          </div>
        </div>

        <nav className="nav">
          <Link className={`navLink ${pathname === "/dashboard" ? "navLinkActive" : ""}`} href="/dashboard">
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </Link>
          <Link className={`navLink ${pathname === "/schools" ? "navLinkActive" : ""}`} href="/schools">
            <Building2 size={18} />
            <span>School Detail</span>
          </Link>
          <Link className={`navLink ${pathname === "/update" ? "navLinkActive" : ""}`} href="/update">
            <ClipboardList size={18} />
            <span>Intern Update</span>
          </Link>
          <Link className={`navLink ${pathname === "/summary" ? "navLinkActive" : ""}`} href="/summary">
            <FileText size={18} />
            <span>End-of-Day</span>
          </Link>
          {profile?.role === "admin" ? (
            <Link className={`navLink ${pathname === "/admin" ? "navLinkActive" : ""}`} href="/admin">
              <ShieldCheck size={18} />
              <span>Admin</span>
            </Link>
          ) : null}
        </nav>

        {profile ? (
          <div className="userRoleCard">
            <strong>{profile.full_name}</strong>
            <span>{profile.role}</span>
          </div>
        ) : null}

        <button className="signOutButton" onClick={handleSignOut}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}