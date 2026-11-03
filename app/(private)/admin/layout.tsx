import type { ReactNode } from "react";
import { AdminRoute } from "@/src/features/auth/components/AdminRoute";

/** Todo lo que está dentro de /admin es solo para admin (un user es redirigido). */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRoute>
      <div className="flex flex-col gap-8">
        <h1 className="font-display text-3xl font-bold">Administración</h1>
        {children}
      </div>
    </AdminRoute>
  );
}
