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
    <div className="surface-card w-full max-h-[80vh] max-w-md overflow-y-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0b203a] dark:text-sky-200">
          Adicionar Evento
        </h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800"
        >
          <X className="h-5 w-5 text-slate-600 dark:text-neutral-300" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="event-name"
            className="block text-sm font-medium text-slate-700 transition-colors dark:text-neutral-300"
          >
            Nome do Evento
          </label>
          <input
            type="text"
            id="event-name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 transition-colors focus:border-[#fca311] focus:outline-none focus:ring-[#fca311] dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder-neutral-500"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="sm:w-1/2">
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-slate-700 transition-colors dark:text-neutral-300"
            >
              Data de Início
            </label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition-colors focus:border-[#fca311] focus:outline-none focus:ring-[#fca311] dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
              required
            />
            <label
              htmlFor="start-time"
              className="mt-2 block text-xs font-medium text-slate-700 transition-colors dark:text-neutral-300"
            >
              Horário de Início (Opcional)
            </label>
            <input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition-colors focus:border-[#fca311] focus:outline-none focus:ring-[#fca311] dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
            />
          </div>
          <div className="sm:w-1/2">
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-slate-700 transition-colors dark:text-neutral-300"
            >
              Data de Fim (Opcional)
            </label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition-colors focus:border-[#fca311] focus:outline-none focus:ring-[#fca311] dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
            />
            <label
              htmlFor="end-time"
              className="mt-2 block text-xs font-medium text-slate-700 transition-colors dark:text-neutral-300"
            >
              Horário de Fim (Opcional)
            </label>
            <input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition-colors focus:border-[#fca311] focus:outline-none focus:ring-[#fca311] dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-slate-700 transition-colors dark:text-neutral-300"
          >
            Local (Opcional)
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 transition-colors focus:border-[#fca311] focus:outline-none focus:ring-[#fca311] dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder-neutral-500"
            placeholder="Ex: Praça do evento"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-slate-700 transition-colors dark:text-neutral-300"
          >
            Descrição
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder-slate-400 transition-colors focus:border-[#fca311] focus:outline-none focus:ring-[#fca311] dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-slate-700 transition-colors dark:text-neutral-300"
          >
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as CalendarEvent["category"])
            }
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-base text-slate-900 transition-colors focus:border-[#fca311] focus:outline-none focus:ring-[#fca311] sm:text-sm dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-100"
          >
            <option value="evento">Evento Comunitário</option>
            <option value="feriado">Feriado</option>
            <option value="religioso">Evento Religioso</option>
            <option value="cultural">Cultural</option>
            <option value="esportivo">Esportivo</option>
          </select>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 transition-colors dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b203a] px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#13335c] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-sky-500 dark:text-neutral-900 dark:hover:bg-sky-400"
          >
            <CalendarIcon className="h-4 w-4" />
            {isSubmitting ? "Enviando..." : "Enviar para aprovação"}
          </button>
        </div>
      </form>
    </div>
  );
}
