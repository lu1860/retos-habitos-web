import { CircleAlert, CircleCheck, Info } from "lucide-react";

type AlertType = "error" | "success" | "info";

interface AlertProps {
  type?: AlertType;
  message: string;
  title?: string;
}

const styles: Record<AlertType, string> = {
  error: "border-coral/30 bg-coral/5 text-coral",
  success: "border-leaf/30 bg-leaf/5 text-leaf",
  info: "border-water/30 bg-water/5 text-water-dark",
};

const icons = { error: CircleAlert, success: CircleCheck, info: Info };

/** Mensaje en la interfaz (errores del backend, confirmaciones). Nunca se usa alert(). */
export function Alert({ type = "error", message, title }: AlertProps) {
  const Icon = icons[type];
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        {title && <p className="font-bold">{title}</p>}
        <p className="text-ink">{message}</p>
      </div>
    </div>
  );
}
