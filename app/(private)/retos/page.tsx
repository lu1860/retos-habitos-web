import type { Metadata } from "next";
import { RetosView } from "@/src/features/retos/components/RetosView";
export const metadata: Metadata = { title: "Retos" };
export default function RetosPage() {
  return <RetosView />;
}
