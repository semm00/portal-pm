"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
// Definição do tipo Event localmente
export type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  category: string;
  description?: string;
};

// Este componente seria idealmente renderizado dentro de um modal.
export default function AddEventForm({
  onClose,
  onAddEvent,
}: {
  onClose: () => void;
  onAddEvent: (event: Omit<Event, "id">) => void;
}) {
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("evento");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      alert("Por favor, insira a data de início.");
      return;
    }
    // Lógica para adicionar o evento
    const newEvent = {
      title: eventName,
      start: new Date(startDate + "T00:00:00"), // Adiciona T00:00:00 para evitar problemas de fuso horário
      end: endDate
        ? new Date(endDate + "T00:00:00")
        : new Date(startDate + "T00:00:00"),
      category,
      description,
    };
    onAddEvent(newEvent);
    onClose(); // Fecha o formulário após a submissão
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#0b203a]">Adicionar Evento</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-100"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="event-name"
            className="block text-sm font-medium text-slate-700"
          >
            Nome do Evento
          </label>
          <input
            type="text"
            id="event-name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-slate-700"
            >
              Data de Início
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm"
              required
            />
          </div>
          <div className="w-1/2">
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-slate-700"
            >
              Data de Fim (Opcional)
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700"
          >
            Descrição
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-slate-700"
          >
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm rounded-md"
          >
            <option value="evento">Evento Comunitário</option>
            <option value="feriado">Feriado</option>
            <option value="religioso">Evento Religioso</option>
            <option value="cultural">Cultural</option>
            <option value="esportivo">Esportivo</option>
          </select>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b203a] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#13335c] transition-all"
          >
            <CalendarIcon className="h-4 w-4" />
            Salvar Evento
          </button>
        </div>
      </form>
    </div>
  );
}
