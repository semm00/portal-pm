//  Calendário com os doze meses
// Página dedicada a exibir um calendário anual com eventos e feriados importantes de Padre Marcos, Piauí.
// Possibilidade de adicionar eventos ao calendário.
// Adicionar descrição do evento, ao lado de cada mês aparece um parte com os eventos daquele mês e descrição
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

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import Calendar from "./components/calendar";
import AddEventForm from "./components/add-event";
import { Event } from "./components/calendar";

export default function CalendarPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);

  const handleAddEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = {
      ...event,
      id: `user-${Date.now()}`,
    };
    setUserEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 text-center lg:text-left lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#153b69] leading-tight">
              Calendário Anual
            </h1>
            <p className="text-md text-[#0b203a]/70">
              Eventos e feriados importantes de Padre Marcos, Piauí.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#fca311] px-5 py-2.5 text-sm font-semibold text-[#0b203a] shadow-md transition-all hover:bg-amber-500"
          >
            <PlusCircle className="h-5 w-5" />
            Adicionar Evento
          </button>
        </div>

        <Calendar events={userEvents} onAddEvent={handleAddEvent} />

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <AddEventForm
              onClose={() => setIsFormOpen(false)}
              onAddEvent={handleAddEvent}
            />
          </div>
        )}
      </div>
    </div>
  );
}
