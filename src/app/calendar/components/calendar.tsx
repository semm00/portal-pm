"use client";

import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- TIPOS E DADOS INICIAIS ---

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: "feriado" | "religioso" | "aniversario" | "evento" | string;
  description?: string;
  location?: string | null;
}

const getInitialEventsForYear = (year: number): CalendarEvent[] => [
  {
    id: "1",
    title: "Dia do Evangélico",
    start: new Date(year, 0, 16),
    end: new Date(year, 0, 16),
    category: "religioso",
    description: "Feriado municipal dedicado à comunidade evangélica.",
  },
  {
    id: "2",
    title: "Aniversário da Cidade",
    start: new Date(year, 0, 17),
    end: new Date(year, 0, 17),
    category: "aniversario",
    description: "Comemoração da emancipação política de Padre Marcos.",
  },
  {
    id: "3",
    title: "Festejos de Santo Antônio",
    start: new Date(year, 4, 31),
    end: new Date(year, 5, 13),
    category: "religioso",
    description: "Tradicionais festejos do padroeiro da cidade, Santo Antônio.",
  },
  {
    id: "4",
    title: "Festejos de São Benedito",
    start: new Date(year, 7, 18),
    end: new Date(year, 7, 26),
    category: "religioso",
    description: "Celebrações em honra a São Benedito, com missas e eventos.",
  },
];

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const categoryStyles: Record<
  string,
  {
    card: string;
    title: string;
    muted: string;
    description: string;
    accent: string;
  }
> = {
  feriado: {
    card: "bg-red-100 dark:bg-red-500/15",
    title: "text-red-800 dark:text-red-100",
    muted: "text-red-800/80 dark:text-red-200/80",
    description: "text-red-800/90 dark:text-red-100/85",
    accent: "text-red-800 dark:text-red-100",
  },
  religioso: {
    card: "bg-sky-100 dark:bg-sky-500/15",
    title: "text-sky-800 dark:text-sky-100",
    muted: "text-sky-800/80 dark:text-sky-200/80",
    description: "text-sky-800/90 dark:text-sky-100/85",
    accent: "text-sky-800 dark:text-sky-100",
  },
  aniversario: {
    card: "bg-amber-100 dark:bg-amber-500/15",
    title: "text-amber-800 dark:text-amber-100",
    muted: "text-amber-800/80 dark:text-amber-200/80",
    description: "text-amber-800/90 dark:text-amber-100/85",
    accent: "text-amber-800 dark:text-amber-100",
  },
  evento: {
    card: "bg-green-100 dark:bg-emerald-500/15",
    title: "text-green-800 dark:text-emerald-100",
    muted: "text-green-800/80 dark:text-emerald-200/80",
    description: "text-green-800/90 dark:text-emerald-100/85",
    accent: "text-green-800 dark:text-emerald-100",
  },
  cultural: {
    card: "bg-purple-100 dark:bg-purple-500/20",
    title: "text-purple-800 dark:text-purple-100",
    muted: "text-purple-800/80 dark:text-purple-200/80",
    description: "text-purple-800/90 dark:text-purple-100/85",
    accent: "text-purple-800 dark:text-purple-100",
  },
  esportivo: {
    card: "bg-emerald-100 dark:bg-emerald-500/20",
    title: "text-emerald-800 dark:text-emerald-100",
    muted: "text-emerald-800/80 dark:text-emerald-200/80",
    description: "text-emerald-800/90 dark:text-emerald-100/85",
    accent: "text-emerald-800 dark:text-emerald-100",
  },
  default: {
    card: "bg-slate-100 dark:bg-slate-500/20",
    title: "text-slate-800 dark:text-slate-100",
    muted: "text-slate-700/80 dark:text-slate-200/80",
    description: "text-slate-700/90 dark:text-slate-200/85",
    accent: "text-slate-800 dark:text-slate-100",
  },
};

// --- COMPONENTE PRINCIPAL DO CALENDÁRIO ---

export default function Calendar({ events }: { events: CalendarEvent[] }) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const allEvents = useMemo(() => {
    const yearEvents = getInitialEventsForYear(currentYear);
    return [
      ...yearEvents,
      ...events.filter((event) => event.start.getFullYear() === currentYear),
    ];
  }, [currentYear, events]);

  const eventsByMonth = useMemo(() => {
    return allEvents.filter((event) => {
      const startsThisYear = event.start.getFullYear() === currentYear;
      if (!startsThisYear) return false;

      const startMonth = event.start.getMonth();
      const endMonth = event.end.getMonth();
      return (
        startMonth === selectedMonth ||
        endMonth === selectedMonth ||
        (startMonth < selectedMonth && endMonth > selectedMonth)
      );
    });
  }, [allEvents, currentYear, selectedMonth]);

  const renderMonth = (monthIndex: number) => {
    const firstDay = new Date(currentYear, monthIndex, 1);
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
    const startingDay = firstDay.getDay();

    const monthEvents = allEvents.filter((event) => {
      if (event.start.getFullYear() !== currentYear) return false;
      const startMonth = event.start.getMonth();
      const endMonth = event.end.getMonth();
      return (
        startMonth === monthIndex ||
        endMonth === monthIndex ||
        (startMonth < monthIndex && endMonth > monthIndex)
      );
    });

    return (
      <div
        key={monthIndex}
        onClick={() => setSelectedMonth(monthIndex)}
        className={`cursor-pointer rounded-2xl p-3 transition-all duration-200 ${
          selectedMonth === monthIndex
            ? "scale-105 bg-[#0b203a] text-white shadow-lg dark:bg-sky-900 dark:text-sky-100 dark:shadow-sky-900/40"
            : "bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-neutral-800/70"
        }`}
      >
        <h3 className="mb-2 text-center text-sm font-bold">
          {months[monthIndex]}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const dayNumber = day + 1;
            const currentDate = new Date(currentYear, monthIndex, dayNumber);
            currentDate.setHours(0, 0, 0, 0);

            const hasEvent = monthEvents.some((event) => {
              const startDate = new Date(event.start);
              startDate.setHours(0, 0, 0, 0);
              const endDate = new Date(event.end);
              endDate.setHours(0, 0, 0, 0);
              return currentDate >= startDate && currentDate <= endDate;
            });

            return (
              <div
                key={dayNumber}
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  hasEvent
                    ? selectedMonth === monthIndex
                      ? "bg-[#fca311] text-[#0b203a] dark:bg-amber-400 dark:text-neutral-900"
                      : "bg-slate-200 dark:bg-neutral-700"
                    : ""
                }`}
              >
                {dayNumber}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-8 text-slate-900 transition-colors duration-300 dark:text-neutral-100 lg:grid-cols-3">
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 transition-colors dark:border-neutral-700/70 dark:bg-neutral-900/50 sm:p-6 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentYear((year) => year - 1)}
            className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-neutral-800"
            aria-label="Ano anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-[#0b203a] dark:text-sky-200">
            {currentYear}
          </h2>
          <button
            onClick={() => setCurrentYear((year) => year + 1)}
            className="rounded-full p-2 transition-colors hover:bg-slate-200 dark:hover:bg-neutral-800"
            aria-label="Próximo ano"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {months.map((_, index) => renderMonth(index))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors dark:border-neutral-700/70 dark:bg-neutral-900/60 sm:p-6">
        <h3 className="mb-4 text-xl font-bold text-[#0b203a] dark:text-sky-200">
          Eventos em {months[selectedMonth]}
        </h3>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
          {eventsByMonth.length > 0 ? (
            eventsByMonth.map((event) => {
              const style =
                categoryStyles[event.category] ?? categoryStyles.default;
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              const isSameDay =
                startDate.toDateString() === endDate.toDateString();

              return (
                <div
                  key={event.id}
                  className={`rounded-lg p-3 transition-colors ${style.card}`}
                >
                  <p className={`text-sm font-bold ${style.title}`}>
                    {event.title}
                  </p>
                  <div
                    className={`mt-1 flex items-center gap-2 text-xs transition-colors ${style.muted}`}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    <span>
                      {startDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      {!isSameDay &&
                        ` a ${endDate.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}`}
                    </span>
                  </div>
                  {event.description && (
                    <p
                      className={`mt-2 text-xs transition-colors ${style.description}`}
                    >
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <p
                      className={`mt-1 text-xs font-medium transition-colors ${style.accent}`}
                    >
                      📍 {event.location}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-slate-500 transition-colors dark:text-neutral-400">
              Nenhum evento para este mês.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
