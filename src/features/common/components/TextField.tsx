"use client";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Mensaje de error del campo; si existe, el borde se pinta y el mensaje se anuncia. */
  error?: string;
  /** Ayuda corta debajo del campo (por ejemplo, las reglas de la contraseña). */
  hint?: string;
}

/**
 * Campo de texto con <label> asociado, ayuda y mensaje de error accesibles.
 * Si type="password", agrega el botón para mostrar u ocultar la contraseña.
 */
export function TextField({
  label,
  error,
  hint,
  id,
  type = "text",
  className = "",
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-bold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`min-h-11 w-full rounded-lg border bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 ${
            error ? "border-coral" : "border-line hover:border-ink-soft/40"
          } ${isPassword ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-coral">
          {error}
        </p>
      )}
    </div>
  );
}
