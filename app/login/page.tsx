"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { PageTransition } from "@/components/PageTransition";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <PageTransition>
    <main className="loginPage">
      <form className="loginCard" onSubmit={handleSignIn}>
        <Image src="/fwps-logo.png" alt="FWPS logo" width={64} height={64} />

        <div>
          <h1>Chromebook Refresh Dashboard</h1>
          <p>Internal Operations Portal</p>
        </div>

        <label>
          Email
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error ? <p className="loginError">{error}</p> : null}

        <button className="primaryButton" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  </PageTransition>
);
}