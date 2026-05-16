import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Sparkles, Radar, ShieldAlert, Share2, Wallet,
  Users, Trophy, Server, ScrollText, Settings, Activity, MessageSquareCode, Webhook,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/app", label: "Command Center", icon: LayoutDashboard },
  { to: "/app/content", label: "Content Factory", icon: Sparkles },
  { to: "/app/jarvis", label: "Jarvis Core", icon: MessageSquareCode },
  { to: "/app/trends", label: "Trend Radar", icon: Radar },
  { to: "/app/policy", label: "Policy Intel", icon: ShieldAlert },
  { to: "/app/social", label: "Distribution", icon: Share2 },
  { to: "/app/providers", label: "Providers", icon: Server },
  { to: "/app/affiliate", label: "Affiliate", icon: Users },
  { to: "/app/gamification", label: "Gamification", icon: Trophy },
  { to: "/app/billing", label: "Billing & Pix", icon: Wallet },
  { to: "/app/governance", label: "Governance", icon: ShieldAlert },
  { to: "/app/logs", label: "Webhooks & Logs", icon: Webhook },
  { to: "/app/ai-health", label: "AI Health", icon: Activity },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function MatrixSidebar() {
  const loc = useLocation();
  const { user, signOut } = useAuth();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="p-5 border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-2">
          <div className="size-8 rounded-md neon-border" style={{ background: "var(--gradient-primary)" }} />
          <span className="font-bold tracking-tight">PORTAL MATRIX</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Viral OS · v0.1</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV.map((item) => {
          const active = loc.pathname === item.to || (item.to !== "/app" && loc.pathname.startsWith(item.to));
          return (
            <Link key={item.to} to={item.to} className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground neon-border"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            )}>
              <item.icon className="size-4" />
              <ScrollText className="hidden" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
        <Button variant="outline" size="sm" className="w-full" onClick={() => void signOut()}>Sign out</Button>
      </div>
    </aside>
  );
}
