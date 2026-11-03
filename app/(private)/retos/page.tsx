import type { Metadata } from "next";
import { RetosHome } from "@/src/features/shell/components/RetosHome";

export const metadata: Metadata = { title: "Retos" };

/** /retos: inicio de la parte privada. B reemplaza RetosHome por la lista de retos. */
export default function RetosPage() {
  return <RetosHome />;
}
