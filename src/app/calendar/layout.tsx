import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Calendário de Eventos de Padre Marcos | Portal PM",
  description:
    "Acompanhe os eventos oficiais e comunitários de Padre Marcos (PI), envie novas atividades para aprovação e mantenha-se informado.",
  keywords: [
    "Padre Marcos",
    "calendário de eventos",
    "eventos municipais",
    "agenda cultural",
    "Portal PM",
    "eventos em Padre Marcos",
    "agenda de eventos Padre Marcos",
    "festas em Padre Marcos PI",
    "programação cultural Padre Marcos",
    "shows em Padre Marcos",
    "calendário de eventos Padre Marcos",
  ],
};

export default function CalendarLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
