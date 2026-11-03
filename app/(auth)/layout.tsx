import type { ReactNode } from "react";
import { Suspense } from "react";
import { AuthLayout } from "@/src/features/auth/components/AuthLayout";
import { GuestRoute } from "@/src/features/auth/components/GuestRoute";
import { Loading } from "@/src/features/common/components/Loading";

/**
 * /login y /register. GuestRoute lleva al inicio a quien ya tiene sesión.
 * Suspense es necesario porque GuestRoute y LoginForm leen la URL (useSearchParams).
 */
export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout>
      <Suspense fallback={<Loading />}>
        <GuestRoute>{children}</GuestRoute>
      </Suspense>
    </AuthLayout>
  );
}
