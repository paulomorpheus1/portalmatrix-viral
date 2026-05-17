import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthProvider } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 matrix-grid">
      <div className="max-w-md text-center glass rounded-xl p-8">
        <h1 className="text-7xl font-bold neon-text">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esta rota não existe no Matrix.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass rounded-xl p-8 max-w-md text-center">
        <h1 className="text-xl font-semibold">Erro inesperado</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Tentar novamente</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Portal Matrix Viral — Infraestrutura autônoma de crescimento" },
      { name: "description", content: "Portal Matrix Viral: criação, distribuição e crescimento autônomo de conteúdo viral com IA, gamificação e InfinitePay." },
      { property: "og:title", content: "Portal Matrix Viral — Infraestrutura autônoma de crescimento" },
      { name: "twitter:title", content: "Portal Matrix Viral — Infraestrutura autônoma de crescimento" },
      { property: "og:description", content: "Portal Matrix Viral: criação, distribuição e crescimento autônomo de conteúdo viral com IA, gamificação e InfinitePay." },
      { name: "twitter:description", content: "Portal Matrix Viral: criação, distribuição e crescimento autônomo de conteúdo viral com IA, gamificação e InfinitePay." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a6925cd3-caee-486b-8cac-9367b961850d/id-preview-95dc7fd3--ea99b65d-c5e6-401f-809b-ab26c75f5413.lovable.app-1778961633108.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a6925cd3-caee-486b-8cac-9367b961850d/id-preview-95dc7fd3--ea99b65d-c5e6-401f-809b-ab26c75f5413.lovable.app-1778961633108.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { router.invalidate(); });
    return () => subscription.unsubscribe();
  }, [router]);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
