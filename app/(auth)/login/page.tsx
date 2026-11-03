import type { Metadata } from "next";
import { LoginForm } from "@/src/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return <LoginForm />;
}
