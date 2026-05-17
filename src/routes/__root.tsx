import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="portal-matrix-theme">
        <Outlet />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
