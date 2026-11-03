import type { Metadata } from "next";
import { RegisterForm } from "@/src/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return <RegisterForm />;
}
