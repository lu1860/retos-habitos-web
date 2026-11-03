"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "../../common/components/Alert";
import { Button } from "../../common/components/Button";
import { TextField } from "../../common/components/TextField";
import { useLoginForm } from "../hooks/useLoginForm";

/** Formulario de inicio de sesión. Los errores del backend se muestran aquí, nunca con alert(). */
export function LoginForm() {
  const form = useLoginForm();
  const sessionExpired = useSearchParams().get("expirada") === "1";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Inicia sesión</h1>
        <p className="mt-2 text-muted">Entra para ver tus retos y registrar el día de hoy.</p>
      </div>

      {sessionExpired && !form.serverError && (
        <Alert type="info" message="Tu sesión terminó. Inicia sesión de nuevo para continuar." />
      )}
      {form.serverError && <Alert message={form.serverError} />}

      <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.values.email}
          onChange={form.handleChange}
          error={form.errors.email}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.values.password}
          onChange={form.handleChange}
          error={form.errors.password}
        />
        <Button type="submit" isLoading={form.isSubmitting} loadingText="Iniciando sesión…">
          Iniciar sesión
        </Button>
      </form>

      <p className="text-sm text-muted">
        ¿Aún no tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-bold text-water-dark underline-offset-4 hover:underline"
        >
          Crea una cuenta
        </Link>
      </p>
    </div>
  );
}
