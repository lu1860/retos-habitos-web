import type { ReactNode } from "react";
import { PublicHeader } from "@/src/features/shell/components/PublicHeader";

/** Páginas públicas: inicio (landing). */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        Proyecto de Aula de Desarrollo Web, 2026-2
      </footer>
    </>
  );
}
