import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/components/auth/LoginBox"; // Ou o caminho padrão que estava antes

export const Route = createFileRoute("/login")({
  component: Login,
});
