import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "FWPS Operations Dashboard",
  description: "Chromebook refresh operations dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
