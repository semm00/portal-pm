"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { CalendarEvent } from "./calendar";

export type EventSubmission = {
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  category: CalendarEvent["category"];
  location?: string;
};

export default function AddEventForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (event: EventSubmission) => Promise<void>;
}) {
  const [eventName, setEventName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CalendarEvent["category"]>("evento");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName.trim()) {
      setError("Informe um título para o evento.");
      return;
    }

    if (!startDate) {
      setError("Por favor, insira a data de início.");
      return;
    }

    if (endDate && endDate < startDate) {
      setError("A data final não pode ser anterior à inicial.");
      return;
    }
    if (startTime && endTime && endTime < startTime) {
      setError("O horário final não pode ser anterior ao inicial.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: eventName.trim(),
        startDate,
        endDate: endDate || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        description: description.trim() || undefined,
        category,
        location: location.trim() || undefined,
      });

      setEventName("");
      setStartDate("");
      setEndDate("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setCategory("evento");
      setLocation("");
      onClose();
    } catch (submitError) {
      console.error(submitError);
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar o evento.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/2">
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
            <label
              htmlFor="start-time"
              className="block mt-2 text-xs font-medium text-slate-700"
            >
              Horário de Início (Opcional)
            </label>
            <input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm"
            />
          </div>
          <div className="sm:w-1/2">
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
            <label
              htmlFor="end-time"
              className="block mt-2 text-xs font-medium text-slate-700"
            >
              Horário de Fim (Opcional)
            </label>
            <input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-slate-700"
          >
            Local (Opcional)
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm"
            placeholder="Ex: Praça do evento"
          />
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
            onChange={(e) =>
              setCategory(e.target.value as CalendarEvent["category"])
            }
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-[#fca311] focus:border-[#fca311] sm:text-sm rounded-md"
          >
            <option value="evento">Evento Comunitário</option>
            <option value="feriado">Feriado</option>
            <option value="religioso">Evento Religioso</option>
            <option value="cultural">Cultural</option>
            <option value="esportivo">Esportivo</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b203a] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#13335c] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <CalendarIcon className="h-4 w-4" />
            {isSubmitting ? "Enviando..." : "Enviar para aprovação"}
          </button>
        </div>
      </form>
    </div>
  );
}
