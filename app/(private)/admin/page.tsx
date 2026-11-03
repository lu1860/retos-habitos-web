import type { Metadata } from "next";
import { UsuariosView } from "@/src/features/usuarios/components/UsuariosView";

export const metadata: Metadata = { title: "Administración" };

/** /admin. C agrega aquí (o en /admin/categorias) la gestión de categorías. */
export default function AdminPage() {
  return <UsuariosView />;
}
