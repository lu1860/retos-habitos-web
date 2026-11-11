
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";

import { SessionProvider } from "@/src/features/auth/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Retos de Hábitos | Cultiva tu bienestar",
    template: "%s · Retos de Hábitos",
  },
  description:
    "Construye hábitos saludables, participa en retos grupales y celebra cada pequeño avance.",
  applicationName: "Retos de Hábitos",
};

export const viewport: Viewport = {
  themeColor: "#F7F5EF",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-dvh flex-col bg-mist font-sans text-ink antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
