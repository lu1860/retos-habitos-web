"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ApiError, getErrorMessage } from "../../common/services/api-error";
import type { LoginCredentials } from "../domain/auth";
import { validateEmail, validateLoginPassword } from "../domain/validation";
import { useSession } from "./useSession";

type LoginErrors = Partial<Record<keyof LoginCredentials, string>>;

const validate = (values: LoginCredentials): LoginErrors => ({
  email: validateEmail(values.email),
  password: validateLoginPassword(values.password),
});

const hasErrors = (errors: LoginErrors) => Object.values(errors).some(Boolean);

/** Estado y envío del formulario de login. La vista (LoginForm) solo dibuja lo que este hook entrega. */
export function useLoginForm() {
  const { login } = useSession();
  const [values, setValues] = useState<LoginCredentials>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // El error de un campo desaparece en cuanto se corrige
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await login({ email: values.email.trim(), password: values.password });
      // La redirección la hace GuestRoute en cuanto hay sesión
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.details as LoginErrors);
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return { values, errors, serverError, isSubmitting, handleChange, handleSubmit };
}
