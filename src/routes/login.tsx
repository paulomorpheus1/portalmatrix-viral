import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/routes/_login"; // Importa o componente que já corrigimos antes

export const Route = createFileRoute("/login")({
  component: Login,
});
