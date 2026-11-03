import type { UserRole } from "../../auth/domain/auth";

export interface NavItem {
  href: string;
  label: string;
  /** Roles que ven el enlace. Ocultar el enlace no protege la ruta: eso lo hacen las guardas. */
  roles: UserRole[];
}

/**
 * Menú de la parte privada. Para una página nueva: crearla en app/(private)/<ruta>/page.tsx
 * y agregar aquí su enlace (por ejemplo, { href: "/progreso", label: "Mi progreso", roles: ["admin", "user"] }).
 */
export const PRIVATE_NAV: NavItem[] = [
  { href: "/retos", label: "Retos", roles: ["admin", "user"] },
  { href: "/admin", label: "Administración", roles: ["admin"] },
];
