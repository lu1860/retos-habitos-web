
import type { Metadata } from "next";
import { DashboardParticipante } from "@/src/features/dashboard/components/DashboardParticipante";

export const metadata: Metadata = {
  title: "Mi inicio",
};

export default function InicioPage() {
  return <DashboardParticipante />;
}
