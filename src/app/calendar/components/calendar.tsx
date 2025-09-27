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

const categoryStyles: Record<string, { bg: string; text: string }> = {
  feriado: { bg: "bg-red-100", text: "text-red-800" },
  religioso: { bg: "bg-sky-100", text: "text-sky-800" },
  aniversario: { bg: "bg-amber-100", text: "text-amber-800" },
  evento: { bg: "bg-green-100", text: "text-green-800" },
  cultural: { bg: "bg-purple-100", text: "text-purple-800" },
  esportivo: { bg: "bg-emerald-100", text: "text-emerald-800" },
  default: { bg: "bg-slate-100", text: "text-slate-800" },
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
            ? "scale-105 bg-[#0b203a] text-white shadow-lg"
            : "bg-white hover:bg-slate-50 hover:shadow-md"
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
                      ? "bg-[#fca311] text-[#0b203a]"
                      : "bg-slate-200"
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentYear((year) => year - 1)}
            className="rounded-full p-2 hover:bg-slate-200"
            aria-label="Ano anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-[#0b203a]">{currentYear}</h2>
          <button
            onClick={() => setCurrentYear((year) => year + 1)}
            className="rounded-full p-2 hover:bg-slate-200"
            aria-label="Próximo ano"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {months.map((_, index) => renderMonth(index))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 text-xl font-bold text-[#0b203a]">
          Eventos em {months[selectedMonth]}
        </h3>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
          {eventsByMonth.length > 0 ? (
            eventsByMonth.map((event) => {
              const style =
                categoryStyles[event.category] || categoryStyles.default;
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              const isSameDay =
                startDate.toDateString() === endDate.toDateString();

              return (
                <div key={event.id} className={`rounded-lg p-3 ${style.bg}`}>
                  <p className={`text-sm font-bold ${style.text}`}>
                    {event.title}
                  </p>
                  <div
                    className={`mt-1 flex items-center gap-2 text-xs ${style.text}/80`}
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
                    <p className={`mt-2 text-xs ${style.text}/90`}>
                      {event.description}
                    </p>
                  )}
                  {event.location && (
                    <p className={`mt-1 text-xs font-medium ${style.text}`}>
                      📍 {event.location}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhum evento para este mês.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
