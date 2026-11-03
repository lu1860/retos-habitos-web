"use client";
import Link from "next/link";
import { HOME_PATH } from "../../auth/domain/routes";
import { useSession } from "../../auth/hooks/useSession";
import { BrandLink } from "../../common/components/BrandLink";

/** Encabezado de las páginas públicas. Cambia los botones según haya o no sesión. */
export function PublicHeader() {
  const { status } = useSession();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <BrandLink />
        <nav aria-label="Cuenta" className="flex items-center gap-2">
          {status === "authenticated" ? (
            <Link
              href={HOME_PATH}
              className="inline-flex min-h-11 items-center rounded-lg bg-water px-4 text-sm font-bold text-white hover:bg-water-dark"
            >
              Ir a mis retos
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-ink-soft hover:bg-ink/5"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center rounded-lg bg-water px-4 text-sm font-bold text-white hover:bg-water-dark"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
