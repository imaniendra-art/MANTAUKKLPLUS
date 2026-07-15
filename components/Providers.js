"use client";

import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeContext";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}
