import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, GlassCard } from "@/components/matrix/primitives";
export const Route = createFileRoute("/_authenticated/app/governance")({ component: () => (
  <><PageHeader kicker="Safety" title="Governance" />
  <GlassCard><ul className="text-sm space-y-2 list-disc pl-5"><li>RLS ativo em todas as tabelas</li><li>Roles em tabela separada (anti privilege-escalation)</li><li>SECURITY DEFINER com search_path travado</li><li>HIBP password check ativo</li><li>Audit logs prontos</li></ul></GlassCard></>
) });
