"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";
  const [checkingAuth, setCheckingAuth] = useState(!isLoginPage);

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
          <Link className="navLink" href="/dashboard">Dashboard</Link>
          <Link className="navLink" href="/schools">School Detail</Link>
          <Link className="navLink" href="/update">Intern Update</Link>
          <Link className="navLink" href="/summary">End-of-Day</Link>
        </nav>

        <button className="signOutButton" onClick={handleSignOut}>
  Sign Out
  
</button>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}