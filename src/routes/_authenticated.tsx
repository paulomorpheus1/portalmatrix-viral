import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { MatrixSidebar } from "@/components/matrix/sidebar";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-background">
      <MatrixSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
