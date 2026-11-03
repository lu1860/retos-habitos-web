"use client";
import Link from "next/link";
import { Alert } from "../../common/components/Alert";
import { Button } from "../../common/components/Button";
import { TextField } from "../../common/components/TextField";
import { PASSWORD_HINT } from "../domain/validation";
import { useRegisterForm } from "../hooks/useRegisterForm";

/** Formulario de registro. Al crear la cuenta, la sesión queda iniciada. */
export function RegisterForm() {
  const form = useRegisterForm();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Crea tu cuenta</h1>
        <p className="mt-2 text-muted">Con tu cuenta te unes a retos y registras tu avance.</p>
      </div>

      {form.serverError && <Alert message={form.serverError} />}

      <form onSubmit={form.handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Nombre"
          name="nombre"
          autoComplete="name"
          value={form.values.nombre}
          onChange={form.handleChange}
          error={form.errors.nombre}
        />
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
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          value={form.values.password}
          onChange={form.handleChange}
          error={form.errors.password}
        />
        <TextField
          label="Repite la contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.values.confirmPassword}
          onChange={form.handleChange}
          error={form.errors.confirmPassword}
        />
        <Button type="submit" isLoading={form.isSubmitting} loadingText="Creando cuenta…">
          Crear cuenta
        </Button>
      </form>

      <p className="text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-bold text-water-dark underline-offset-4 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
