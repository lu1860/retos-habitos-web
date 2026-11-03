"use client";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useSession } from "../../auth/hooks/useSession";
import { BrandLink } from "../../common/components/BrandLink";
import { PRIVATE_NAV } from "../domain/navigation";

/** Encabezado y menú de la parte privada. El menú muestra solo los enlaces del rol. */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setMenuOpen] = useState(false);

  if (!user) return null;
  const items = PRIVATE_NAV.filter((item) => item.roles.includes(user.rol));
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const links = items.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setMenuOpen(false)}
      aria-current={isActive(item.href) ? "page" : undefined}
      className={`rounded-lg px-3 py-2 text-sm font-bold ${
        isActive(item.href) ? "bg-water/10 text-water-dark" : "text-ink-soft hover:bg-ink/5"
      }`}
    >
      {item.label}
    </Link>
  ));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <BrandLink href="/retos" />
            <nav aria-label="Menú principal" className="hidden gap-1 md:flex">
              {links}
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-bold">{user.nombre}</p>
              <p className="text-xs text-muted">
                {user.rol === "admin" ? "Admin" : "Participante"}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm font-bold text-ink-soft hover:border-coral hover:text-coral"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="menu-movil"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div
            id="menu-movil"
            className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden"
          >
            <p className="px-3 pb-2 text-sm text-muted">
              {user.nombre} ({user.rol === "admin" ? "admin" : "participante"})
            </p>
            <nav aria-label="Menú principal" className="flex flex-col gap-1">
              {links}
            </nav>
            <button
              type="button"
              onClick={logout}
              className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-left text-sm font-bold text-coral"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
