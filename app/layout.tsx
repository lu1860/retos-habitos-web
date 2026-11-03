import type { ReactNode } from "react";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/src/features/auth/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Retos de hábitos",
    template: "%s · Retos de hábitos",
  },
  description: "Únete a retos cortos en grupo y registra tu avance cada día.",
};

export const viewport: Viewport = {
  themeColor: "#12324a",
};

/**
 * Layout raíz: lo comparten todas las páginas.
 * SessionProvider deja la sesión disponible en toda la aplicación (useSession).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col bg-mist text-ink antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
