"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ApiError, getErrorMessage } from "../../common/services/api-error";
import type { RegisterPayload } from "../domain/auth";
import {
  validateConfirmation,
  validateEmail,
  validateNewPassword,
  validateNombre,
} from "../domain/validation";
import { useSession } from "./useSession";

interface RegisterValues extends RegisterPayload {
  /** Solo existe en el formulario: no se envía a la API. */
  confirmPassword: string;
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

const INITIAL_VALUES: RegisterValues = { nombre: "", email: "", password: "", confirmPassword: "" };

const validate = (values: RegisterValues): RegisterErrors => ({
  nombre: validateNombre(values.nombre),
  email: validateEmail(values.email),
  password: validateNewPassword(values.password),
  confirmPassword: validateConfirmation(values.password, values.confirmPassword),
});

/** Estado y envío del formulario de registro. Si sale bien, la sesión queda iniciada. */
export function useRegisterForm() {
  const { register } = useSession();
  const [values, setValues] = useState<RegisterValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(values);
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await register({
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        password: values.password,
      });
    } catch (error) {
      // Errores del backend: email repetido (409) o un campo inválido (400 con detalle por campo)
      if (error instanceof ApiError) setErrors(error.details as RegisterErrors);
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return { values, errors, serverError, isSubmitting, handleChange, handleSubmit };
}
