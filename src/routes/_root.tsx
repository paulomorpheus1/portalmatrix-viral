import { createRootRoute, Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark min-h-screen bg-background text-foreground antialiased">
        <Outlet />
        <ScrollRestoration />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
