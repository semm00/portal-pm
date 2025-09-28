//  Calendário com os doze meses
// Página dedicada a exibir um calendário anual com eventos e feriados importantes de Padre Marcos, Piauí.
// Possibilidade de adicionar eventos ao calendário.
// Adicionar descrição do even        {feedback && (cada mês aparece um parte com os eventos daquele mês e descrição
// integração com atela home onde aparece os próximos eventos
/*
Página do Calendário Anual de Padre Marcos, Piauí
- Exibição de um calendário anual com destaque para feriados municipais, estaduais e nacionais.
- Listagem de eventos importantes da cidade, como festivais, feiras e celebrações culturais.
- Opção para os usuários adicionarem eventos ao calendário, promovendo o engajamento comunitário.
- Integração com a página inicial para mostrar os próximos eventos em destaque.
- Design responsivo para acesso em dispositivos móveis.
- Foco na usabilidade e clareza das informações para facilitar o planejamento dos moradores.
*/

"use client";

import { useCallback, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import type { Metadata } from "next";
import Calendar, { type CalendarEvent } from "./components/calendar";
import AddEventForm, { type EventSubmission } from "./components/add-event";
import { buildApiUrl } from "@/lib/api";
import type { AuthUser } from "../profile/types";
import { loadSession } from "../profile/utils/session";

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
  ],
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
} | null;

type ApiEvent = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  location?: string | null;
  startDate: string;
  endDate: string;
};

const mapToCalendarEvent = (event: ApiEvent): CalendarEvent | null => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate ?? event.startDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return {
    id: event.id,
    title: event.title,
    start,
    end,
    category: (event.category || "evento") as CalendarEvent["category"],
    description: event.description ?? undefined,
    location: event.location ?? undefined,
  };
};

export default function CalendarPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [approvedEvents, setApprovedEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const syncSession = () => {
      const current = loadSession();
      setUser(current);
    };

    syncSession();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("storage", syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const fetchApprovedEvents = useCallback(async () => {
    setIsLoadingEvents(true);

    try {
      const response = await fetch(buildApiUrl("/api/events"), {
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message || "Não foi possível carregar os eventos aprovados."
        );
      }

      const data = await response.json();
      const normalized: CalendarEvent[] = (data.events ?? [])
        .map(mapToCalendarEvent)
        .filter(Boolean) as CalendarEvent[];

      setApprovedEvents(normalized);
      setFeedback(null);
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao carregar os eventos.",
      });
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovedEvents();
  }, [fetchApprovedEvents]);

  const handleSubmitEvent = useCallback(
    async (payload: EventSubmission) => {
      if (!user || !user.token) {
        throw new Error("Faça login para enviar um evento.");
      }

      // Corrige o envio da data para o backend, usando fuso local
      function toIsoDate(dateStr?: string) {
        if (!dateStr) return undefined;
        // Garante que o ISO sempre será do dia correto, sem offset de fuso
        return dateStr + "T00:00:00";
      }

      const body = {
        title: payload.title,
        category: payload.category,
        description: payload.description,
        location: payload.location,
        startDate: toIsoDate(payload.startDate),
        endDate: toIsoDate(payload.endDate ?? payload.startDate),
        startTime: payload.startTime,
        endTime: payload.endTime,
      };

      const response = await fetch(buildApiUrl("/api/events"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.message || "Não foi possível enviar o evento para aprovação."
        );
      }

      setFeedback({
        type: "success",
        message:
          "Evento enviado para aprovação! Assim que liberado pela equipe, ele aparecerá no calendário.",
      });
    },
    [user]
  );

  const handleOpenForm = useCallback(() => {
    if (!user || !user.token) {
      setFeedback({
        type: "error",
        message:
          "Para cadastrar um evento, acesse a área de Perfil e faça login. Depois, clique em 'Adicionar Evento' para enviar a sua proposta.",
      });
      return;
    }

    setIsFormOpen(true);
  }, [user]);

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 text-center lg:text-left lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#153b69] leading-tight">
              Calendário Anual
            </h1>
            <p className="text-md text-[#0b203a]/70">
              Eventos e feriados importantes de Padre Marcos, Piauí.
            </p>
            <p className="text-sm text-slate-500">
              Envie um evento para aprovação e acompanhe os eventos já
              confirmados.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <button
              onClick={handleOpenForm}
              disabled={!user || !user.token}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#fca311] px-5 py-2.5 text-sm font-semibold text-[#0b203a] shadow-md transition-all hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusCircle className="h-5 w-5" />
              Adicionar Evento
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {feedback.message}
          </div>
        )}
        {isLoadingEvents ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50">
            <p className="text-sm text-slate-500">
              Carregando eventos aprovados...
            </p>
          </div>
        ) : (
          <Calendar events={approvedEvents} />
        )}

        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <AddEventForm
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleSubmitEvent}
            />
          </div>
        )}
      </div>
    </div>
  );
}
