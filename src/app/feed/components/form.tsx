"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Video,
  BarChart3,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  X,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { buildApiUrl } from "@/lib/api";
import { loadSession } from "@/app/profile/utils/session";
import type { AuthUser } from "@/app/profile/types";

interface NominatimResult {
  display_name: string;
  // Adicione outras propriedades se necessário
}

type Category = "avisos" | "eventos" | "enquetes" | "locais" | "outro";

const categories: Array<{ label: string; value: Category }> = [
  { label: "Avisos", value: "avisos" },
  { label: "Eventos", value: "eventos" },
  { label: "Enquetes", value: "enquetes" },
  { label: "Locais", value: "locais" },
  { label: "Outro", value: "outro" },
];

const MAX_ATTACHMENTS = 6;

const formatDisplayName = (value?: string | null) => {
  if (!value) return "Morador";

  return value
    .trim()
    .split(/\s+/)
    .map(
      (part) =>
        part.charAt(0).toLocaleUpperCase("pt-BR") +
        part.slice(1).toLocaleLowerCase("pt-BR")
    )
    .join(" ");
};

const getFirstName = (value?: string | null) => {
  const formatted = formatDisplayName(value);
  return formatted.split(" ")[0] ?? formatted;
};

export default function FeedForm() {
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [customCategory, setCustomCategory] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventTime, setEventTime] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [session, setSession] = useState<AuthUser | null>(() => loadSession());
  const firstName = getFirstName(session?.name);
  const isLogged = Boolean(session?.token);
  const contentPlaceholder = isLogged
    ? `${firstName}, o que está acontecendo em Padre Marcos?`
    : "O que está acontecendo em Padre Marcos?";

  const syncSession = useCallback(() => {
    setSession(loadSession());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    syncSession();
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
    };
  }, [syncSession]);

  const resetForm = () => {
    setContent("");
    setCategory("");
    setCustomCategory("");
    setAttachments([]);
    setShowPoll(false);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowLocation(false);
    setLocation("");
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setShowDate(false);
    setEventDate(null);
    setEventTime("");
    setIsImportant(false);
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).slice(0, MAX_ATTACHMENTS);
    setAttachments(fileArray);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  const handleAddPollOption = () => {
    if (pollOptions.length >= 4) return;
    setPollOptions((prev) => [...prev, ""]);
  };

  const handleSelectLocation = async (value: string) => {
    setLocation(value);
    setShowLocationSuggestions(false);
  };

  const handleLocationChange = async (value: string) => {
    setLocation(value);
    if (value.length > 2) {
      setLocationLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&countrycodes=BR&limit=5`
        );
        const data: NominatimResult[] = await response.json();
        const suggestions = data.map((item) => item.display_name);
        setLocationSuggestions(suggestions);
        setShowLocationSuggestions(true);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      } finally {
        setLocationLoading(false);
      }
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const validateForm = () => {
    if (!content.trim() && attachments.length === 0) {
      return "Escreva algo ou envie um arquivo.";
    }
    if (!category) {
      return "Selecione uma categoria para o conteúdo.";
    }
    if (category === "outro" && !customCategory.trim()) {
      return "Descreva a categoria em 'Outro'.";
    }
    if (showPoll) {
      if (!pollQuestion.trim()) {
        return "Informe a pergunta da enquete.";
      }
      const filledOptions = pollOptions.filter((opt) => opt.trim().length > 0);
      if (filledOptions.length < 2) {
        return "Forneça pelo menos duas opções para a enquete.";
      }
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!session?.token) {
      setError("Faça login para publicar no mural.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("category", category);
      if (category === "outro") {
        formData.append("customCategory", customCategory.trim());
      }
      formData.append("isImportant", String(isImportant));
      formData.append("alertUsers", String(isImportant));

      attachments.forEach((file) => {
        formData.append("media", file);
      });

      if (showPoll) {
        formData.append("pollQuestion", pollQuestion.trim());
        pollOptions
          .filter((opt) => opt.trim().length > 0)
          .forEach((opt, index) => {
            formData.append(`pollOptions[${index}]`, opt.trim());
          });
      }

      if (showLocation && location.trim()) {
        formData.append("location", location.trim());
      }

      if (showDate && eventDate && eventTime) {
        const [hours, minutes] = eventTime.split(":").map(Number);
        const dateTime = new Date(eventDate);
        dateTime.setHours(hours, minutes);
        formData.append("eventDate", dateTime.toISOString());
      }

      const response = await fetch(buildApiUrl("/api/posts"), {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar o post para moderação.");
      }

      setSuccess(
        "Post enviado para moderação! Assim que aprovado, aparecerá no feed."
      );
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro inesperado. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-gradient-to-r from-white via-[#f8fbff] pt-5">
      {!session?.token && (
        <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-600">
          Faça login na área de Perfil para publicar no mural digital.
        </div>
      )}
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="w-full space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={contentPlaceholder}
            rows={3}
            className="w-full resize-none rounded-2xl bg-slate-100 px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b203a]"
          />

          <div className="flex items-center justify-between text-xs text-[#0b203a]/50">
            <span>{content.length} caracteres</span>
            {attachments.length > 0 && (
              <span>
                {attachments.length}/{MAX_ATTACHMENTS} anexos
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[#0b203a]/80">
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              className="flex items-center gap-2 rounded-full border border-dashed border-[#0b203a]/30 px-3 py-1.5 text-[#0b203a] hover:border-[#fca311] hover:bg-[#fca311]/15 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
              Fotos/Vídeos
            </button>
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              className="hidden" // Vídeo já coberto pelo input de mídia
            >
              <Video className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowPoll((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 border transition-colors ${
                showPoll
                  ? "bg-[#0b203a] text-white border-[#0b203a]"
                  : "border-[#0b203a]/30 text-[#0b203a] hover:border-[#fca311] hover:bg-[#fca311]/15"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Enquete
            </button>
            <button
              type="button"
              onClick={() => setShowLocation((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 border transition-colors ${
                showLocation
                  ? "bg-[#0b203a] text-white border-[#0b203a]"
                  : "border-[#0b203a]/30 text-[#0b203a] hover:border-[#fca311] hover:bg-[#fca311]/15"
              }`}
            >
              <MapPin className="h-4 w-4" />
              Local
            </button>
            <button
              type="button"
              onClick={() => setShowDate((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 border transition-colors ${
                showDate
                  ? "bg-[#0b203a] text-white border-[#0b203a]"
                  : "border-[#0b203a]/30 text-[#0b203a] hover:border-[#fca311] hover:bg-[#fca311]/15"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Data
            </button>
            <input
              ref={mediaInputRef}
              onChange={(event) => handleFileChange(event.target.files)}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
            />
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-[#0b203a]/70">
              {attachments.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0b203a]/5 px-3 py-1 text-[#0b203a]"
                >
                  <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                  <span className="max-w-[180px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="rounded-full bg-white/60 p-1 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label="Remover arquivo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200" />

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-600">
            O que é isso?
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(({ label, value }) => {
              const isActive = category === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "border-[#0b203a] bg-[#0b203a] text-white shadow-md shadow-[#0b203a]/30"
                      : "border-[#0b203a]/30 text-[#0b203a] hover:border-[#0b203a] hover:bg-[#0b203a]/10"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {category === "outro" && (
            <input
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value)}
              placeholder="Descreva a categoria"
              className="w-full rounded-xl border border-[#0b203a]/20 px-4 py-2 text-sm focus:border-[#0b203a] focus:outline-none focus:ring-1 focus:ring-[#0b203a] bg-white"
            />
          )}
        </section>

        {showPoll && (
          <section className="rounded-2xl border border-[#0b203a]/20 bg-gradient-to-br from-slate-50/80 to-[#0b203a]/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0b203a]">
              <BarChart3 className="h-4 w-4" />
              Configurar enquete
            </div>
            <input
              value={pollQuestion}
              onChange={(event) => setPollQuestion(event.target.value)}
              placeholder="Pergunta da enquete"
              className="w-full rounded-lg border border-[#0b203a]/20 px-4 py-2 text-sm focus:border-[#0b203a] focus:outline-none focus:ring-1 focus:ring-[#0b203a] bg-white"
            />
            <div className="space-y-2">
              {pollOptions.map((option, index) => (
                <input
                  key={index}
                  value={option}
                  onChange={(event) => {
                    const newOptions = [...pollOptions];
                    newOptions[index] = event.target.value;
                    setPollOptions(newOptions);
                  }}
                  placeholder={`Opção ${index + 1}`}
                  className="w-full rounded-lg border border-[#0b203a]/20 px-4 py-2 text-sm focus:border-[#0b203a] focus:outline-none focus:ring-1 focus:ring-[#0b203a] bg-white"
                />
              ))}
            </div>
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="text-sm text-[#0b203a] hover:text-[#fca311] transition-colors font-medium"
              >
                + adicionar opção
              </button>
            )}
          </section>
        )}

        {showLocation && (
          <section className="rounded-2xl border border-[#0b203a]/20 bg-gradient-to-br from-slate-50/80 to-[#0b203a]/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0b203a]">
              <MapPin className="h-4 w-4" />
              Localização
            </div>
            <div className="relative">
              <input
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="Ex.: Praça Miguel Arraes"
                className="w-full rounded-lg border border-[#0b203a]/20 px-4 py-2 text-sm focus:border-[#0b203a] focus:outline-none focus:ring-1 focus:ring-[#0b203a] bg-white"
              />
              {locationLoading && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0b203a]" />
                </div>
              )}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-[#0b203a]/20 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-[#0b203a]/10 transition-colors"
                      onClick={() => handleSelectLocation(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {showDate && (
          <section className="rounded-2xl border border-[#0b203a]/20 bg-gradient-to-br from-slate-50/80 to-[#0b203a]/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0b203a]">
              <Calendar className="h-4 w-4" />
              Data do evento
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#0b203a] mb-1">
                  Data
                </label>
                <DatePicker
                  selected={eventDate}
                  onChange={(date) => setEventDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecione a data"
                  className="w-full rounded-lg border border-[#0b203a]/20 px-4 py-2 text-sm focus:border-[#0b203a] focus:outline-none focus:ring-1 focus:ring-[#0b203a] bg-white"
                  wrapperClassName="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0b203a] mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full rounded-lg border border-[#0b203a]/20 px-4 py-2 text-sm focus:border-[#0b203a] focus:outline-none focus:ring-1 focus:ring-[#0b203a] bg-white"
                />
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-[#0b203a]/20 bg-gradient-to-br from-slate-50/80 to-[#0b203a]/5 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-[#0b203a]/80">
            <AlertTriangle className="h-5 w-5 text-[#fca311]" />
            <span>Este conteúdo será enviado para moderação.</span>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-[#0b203a]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#0b203a]/30 text-[#0b203a] focus:ring-[#0b203a]"
              checked={isImportant}
              onChange={(event) => setIsImportant(event.target.checked)}
            />
            <span>Marcar como importante (alertar usuários)</span>
          </label>
        </section>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}

        <footer className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="text-xs text-[#0b203a]/70">
            Apenas usuários cadastrados podem enviar atualizações.
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !session?.token}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b203a] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#13335c] hover:shadow-[#fca311]/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>Enviar atualização</>
            )}
          </button>
        </footer>
      </form>
    </section>
  );
}
