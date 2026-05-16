import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard } from "@/components/matrix/primitives";
import { useAuth } from "@/hooks/use-auth";
export const Route = createFileRoute("/_authenticated/app/settings")({ component: Page });
function Page() {
  const { user } = useAuth();
  return (<><PageHeader kicker="Account" title="Settings" />
    <GlassCard><p className="text-sm"><b>Email:</b> {user?.email}</p><p className="text-sm mt-1"><b>ID:</b> <code className="text-xs">{user?.id}</code></p></GlassCard></>);
}
