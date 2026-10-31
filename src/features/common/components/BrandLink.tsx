import Link from "next/link";

interface BrandLinkProps {
  tone?: "dark" | "light";
  href?: string;
}

/** Nombre de la aplicación con su ícono; lleva al inicio. */
export function BrandLink({ tone = "light", href = "/" }: BrandLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-display text-lg font-bold ${tone === "dark" ? "text-white" : "text-ink"}`}
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill={tone === "dark" ? "#ffffff" : "#12324a"} />
        <path
          d="M9.5 16.5l4.2 4.2 8.8-9.4"
          fill="none"
          stroke="#f4b63f"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Retos de hábitos
    </Link>
  );
}
