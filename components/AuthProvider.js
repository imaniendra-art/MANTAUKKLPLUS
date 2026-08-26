"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  session: null,
  status: "loading", // "loading" | "authenticated" | "unauthenticated"
  update: async () => {},
  refetch: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setSession({ user: data.user });
          setStatus("authenticated");
          return { user: data.user };
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
    return null;
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const update = async (newData) => {
    if (newData) {
      setSession((prev) => {
        if (!prev || !prev.user) return prev;
        return {
          ...prev,
          user: { ...prev.user, ...newData },
        };
      });
    }
    return await fetchSession();
  };

  return (
    <AuthContext.Provider value={{ session, status, update, refetch: fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return { 
    data: context.session, 
    status: context.status, 
    update: context.update,
    refetch: context.refetch,
  };
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
