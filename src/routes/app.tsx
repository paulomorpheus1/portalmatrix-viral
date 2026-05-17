import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: AppComponent,
});

function AppComponent() {
  return <Outlet />;
}
