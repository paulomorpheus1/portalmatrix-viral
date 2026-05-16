import { type ReactNode } from "react";

export function PageHeader({ title, kicker, children }: { title: string; kicker?: string; children?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-4 pb-6 border-b border-border mb-6">
      <div>
        {kicker && <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{kicker}</p>}
        <h1 className="text-3xl font-bold neon-text">{title}</h1>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </header>
  );
}

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-xl p-5 ${className}`}>{children}</div>;
}

export function Stat({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {delta && <p className="mt-1 text-xs text-success">{delta}</p>}
    </GlassCard>
  );
}
