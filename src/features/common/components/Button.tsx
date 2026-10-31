import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Mientras sea true el botón se deshabilita y muestra loadingText. */
  isLoading?: boolean;
  loadingText?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-water text-white hover:bg-water-dark",
  secondary: "border border-line bg-surface text-ink hover:border-water hover:text-water-dark",
  ghost: "text-ink-soft hover:bg-ink/5",
  danger: "bg-coral text-white hover:bg-coral/90",
};

/** Botón reutilizable. Se deshabilita mientras carga para evitar envíos dobles. */
export function Button({
  variant = "primary",
  isLoading = false,
  loadingText = "Procesando…",
  className = "",
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
