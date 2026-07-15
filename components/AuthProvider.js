"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  session: null,
  status: "loading", // "loading" | "authenticated" | "unauthenticated"
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setSession({ user: data.user });
            setStatus("authenticated");
          } else {
            setSession(null);
            setStatus("unauthenticated");
          }
        } else {
          setSession(null);
          setStatus("unauthenticated");
        }
      } catch (error) {
        setSession(null);
        setStatus("unauthenticated");
      }
    }

    fetchSession();
  }, []);

  return (
    <AuthContext.Provider value={{ session, status }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return { data: context.session, status: context.status };
}

export async function signIn(credentials) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();
    return data; // { success: true, user: ... } or { error: "..." }
  } catch (error) {
    return { error: "Gagal terhubung ke server" };
  }
}

export async function signOut() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}
