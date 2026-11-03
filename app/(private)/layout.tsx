import type { ReactNode } from "react";
import { PrivateRoute } from "@/src/features/auth/components/PrivateRoute";
import { AppShell } from "@/src/features/shell/components/AppShell";

/** Todo lo que está dentro de app/(private) exige sesión: sin sesión, PrivateRoute lleva al login. */
export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <PrivateRoute>
      <AppShell>{children}</AppShell>
    </PrivateRoute>
  );
}
