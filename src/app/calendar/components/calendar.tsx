"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

// --- TIPOS E DADOS INICIAIS ---

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: "feriado" | "religioso" | "aniversario" | "evento" | string;
  description?: string;
}

const getInitialEventsForYear = (year: number): Event[] => [
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

const categoryStyles: { [key: string]: { bg: string; text: string } } = {
  feriado: { bg: "bg-red-100", text: "text-red-800" },
  religioso: { bg: "bg-sky-100", text: "text-sky-800" },
  aniversario: { bg: "bg-amber-100", text: "text-amber-800" },
  evento: { bg: "bg-green-100", text: "text-green-800" },
  default: { bg: "bg-slate-100", text: "text-slate-800" },
};

// --- COMPONENTE PRINCIPAL DO CALENDÁRIO ---

export default function Calendar({
  events,
  onAddEvent,
}: {
  events: Event[];
  onAddEvent: (event: Omit<Event, "id">) => void;
}) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const allEvents = useMemo(() => {
    const yearEvents = getInitialEventsForYear(currentYear);
    // Em um app real, os 'events' viriam de uma API e seriam combinados aqui
    return [
      ...yearEvents,
      ...events.filter((e) => e.start.getFullYear() === currentYear),
    ];
  }, [currentYear, events]);

  const eventsByMonth = useMemo(() => {
    return allEvents.filter(
      (event) =>
        event.start.getFullYear() === currentYear &&
        (event.start.getMonth() === selectedMonth ||
          event.end.getMonth() === selectedMonth ||
          (event.start.getMonth() < selectedMonth &&
            event.end.getMonth() > selectedMonth))
    );
  }, [allEvents, currentYear, selectedMonth]);

  const renderMonth = (monthIndex: number) => {
    const firstDay = new Date(currentYear, monthIndex, 1);
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
    const startingDay = firstDay.getDay();

    const monthEvents = allEvents.filter(
      (e) =>
        e.start.getFullYear() === currentYear &&
        (e.start.getMonth() === monthIndex ||
          e.end.getMonth() === monthIndex ||
          (e.start.getMonth() < monthIndex && e.end.getMonth() > monthIndex))
    );

    return (
      <div
        key={monthIndex}
        onClick={() => setSelectedMonth(monthIndex)}
        className={`cursor-pointer p-3 rounded-2xl transition-all duration-200 ${
          selectedMonth === monthIndex
            ? "bg-[#0b203a] text-white shadow-lg scale-105"
            : "bg-white hover:bg-slate-50 hover:shadow-md"
        }`}
      >
        <h3 className="font-bold text-center text-sm mb-2">
          {months[monthIndex]}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-xs text-center">
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, day) => {
            const dayNumber = day + 1;
            const currentDate = new Date(currentYear, monthIndex, dayNumber);
            currentDate.setHours(0, 0, 0, 0);

            const isEvent = monthEvents.some((e) => {
              const startDate = new Date(e.start);
              startDate.setHours(0, 0, 0, 0);
              const endDate = new Date(e.end);
              endDate.setHours(0, 0, 0, 0);
              return currentDate >= startDate && currentDate <= endDate;
            });

            return (
              <div
                key={day}
                className={`h-5 w-5 rounded-full flex items-center justify-center ${
                  isEvent
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna do Calendário Anual */}
      <div className="lg:col-span-2 bg-slate-50/80 p-4 sm:p-6 rounded-3xl border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentYear(currentYear - 1)}
            className="p-2 rounded-full hover:bg-slate-200"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-[#0b203a]">{currentYear}</h2>
          <button
            onClick={() => setCurrentYear(currentYear + 1)}
            className="p-2 rounded-full hover:bg-slate-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((_, index) => renderMonth(index))}
        </div>
      </div>

      {/* Coluna de Eventos do Mês */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-xl font-bold text-[#0b203a] mb-4">
          Eventos em {months[selectedMonth]}
        </h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {eventsByMonth.length > 0 ? (
            eventsByMonth.map((event) => {
              const style =
                categoryStyles[event.category] || categoryStyles.default;
              return (
                <div key={event.id} className={`p-3 rounded-lg ${style.bg}`}>
                  <p className={`font-bold text-sm ${style.text}`}>
                    {event.title}
                  </p>
                  <div
                    className={`flex items-center gap-2 text-xs mt-1 ${style.text}/80`}
                  >
                    <CalendarIcon className="h-3 w-3" />
                    <span>
                      {event.start.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      {event.end.getDate() !== event.start.getDate() &&
                        ` a ${event.end.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}`}
                    </span>
                  </div>
                  {event.description && (
                    <p className={`text-xs mt-2 ${style.text}/90`}>
                      {event.description}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              Nenhum evento para este mês.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
