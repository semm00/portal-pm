import React from "react";
import { buildApiUrl } from "@/lib/api";

type ApiEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: string;
  endDate: string;
};

type EventItem = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
};

type RecurringEventDefinition = {
  id: string;
  title: string;
  description: string;
  location?: string;
  start: { month: number; day: number };
  end?: { month: number; day: number };
};

const RECURRING_EVENTS: RecurringEventDefinition[] = [
  {
    id: "default-evangelico",
    title: "Dia do Evangélico",
    description: "Celebração municipal dedicada à comunidade evangélica.",
    start: { month: 0, day: 16 },
  },
  {
    id: "default-aniversario",
    title: "Aniversário de Padre Marcos",
    description: "Comemoração da emancipação política do município.",
    start: { month: 0, day: 17 },
  },
  {
    id: "default-santo-antonio",
    title: "Festejos de Santo Antônio",
    description: "Tradicionais festejos do padroeiro da cidade.",
    start: { month: 4, day: 31 },
    end: { month: 5, day: 13 },
  },
  {
    id: "default-sao-joao",
    title: "São João",
    description:
      "Celebração junina com quadrilhas, comidas típicas e forró para toda a família.",
    start: { month: 5, day: 24 },
  },
  {
    id: "default-sao-benedito",
    title: "Festejos de São Benedito",
    description: "Programação religiosa e cultural em honra a São Benedito.",
    start: { month: 7, day: 18 },
    end: { month: 7, day: 26 },
  },
];

const toUtcDate = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day, 12, 0, 0));

const resolveNextOccurrence = (
  definition: RecurringEventDefinition,
  referenceDate: Date
) => {
  const { start, end = start } = definition;
  const referenceYear = referenceDate.getFullYear();

  const startCurrentYear = toUtcDate(referenceYear, start.month, start.day);
  let endCurrentYear = toUtcDate(referenceYear, end.month, end.day);

  if (endCurrentYear.getTime() < startCurrentYear.getTime()) {
    endCurrentYear = toUtcDate(referenceYear + 1, end.month, end.day);
  }

  if (endCurrentYear.getTime() < referenceDate.getTime()) {
    const nextYear = referenceYear + 1;
    const nextStart = toUtcDate(nextYear, start.month, start.day);
    let nextEnd = toUtcDate(nextYear, end.month, end.day);

    if (nextEnd.getTime() < nextStart.getTime()) {
      nextEnd = toUtcDate(nextYear + 1, end.month, end.day);
    }

    return { start: nextStart, end: nextEnd };
  }

  return { start: startCurrentYear, end: endCurrentYear };
};

const buildFallbackEvents = (): EventItem[] => {
  const now = new Date();

  const upcoming = RECURRING_EVENTS.map((event) => {
    const { start, end } = resolveNextOccurrence(event, now);

    return {
      id: `${event.id}-${start.getUTCFullYear()}`,
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    } satisfies EventItem;
  })
    .filter((event) => {
      // Só mostra eventos cujo início é no futuro (>= agora)
      const startTime = Date.parse(event.startDate);
      return Number.isFinite(startTime) ? startTime >= now.getTime() : true;
    })
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));

  return upcoming.slice(0, 4);
};

async function getEvents(): Promise<EventItem[]> {
  const fallback = buildFallbackEvents();

  try {
    const response = await fetch(buildApiUrl("/api/events?limit=8"), {
      cache: "no-store",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Falha ao carregar eventos.");
    }

    const data = await response.json();
    const events = (data.events as ApiEvent[] | undefined) ?? [];
    const now = Date.now();

    const sorted = events
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description ?? undefined,
        location: event.location ?? undefined,
        startDate: event.startDate,
        endDate: event.endDate ?? event.startDate,
      }))
      .filter((event) => {
        const endTime = Date.parse(event.endDate);
        return Number.isFinite(endTime) ? endTime >= now : true;
      })
      .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate))
      .slice(0, 4);

    return sorted.length > 0 ? sorted : fallback;
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

function formatDateRange(startIso: string, endIso: string) {
  try {
    const start = new Date(startIso);
    const end = new Date(endIso);

    const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (start.toDateString() === end.toDateString()) {
      return dateFormatter.format(start);
    }

    return `${dateFormatter.format(start)} até ${dateFormatter.format(end)}`;
  } catch {
    return startIso;
  }
}

export default async function Events() {
  const display = await getEvents();

  return (
    <section
      aria-labelledby="events-heading"
      className="surface-card px-5 sm:px-8 md:px-10 py-6"
    >
      <h2
        id="events-heading"
        className="mb-4 inline-flex items-center gap-2 text-xl font-bold text-[#0a4ea1] dark:text-sky-300"
      >
        Próximos Eventos
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {display.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed border-slate-300 bg-slate-50 py-6 text-center text-sm text-slate-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300">
            Nenhum evento aprovado foi encontrado. Volte em breve!
          </p>
        )}
        {display.map((ev) => {
          const startDate = new Date(ev.startDate);

          return (
            <article
              key={ev.id}
              className="group surface-panel relative flex flex-col overflow-hidden p-4 text-slate-900 transition-transform hover:-translate-y-1 hover:shadow-md dark:text-neutral-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-sky-200 to-amber-200 text-sky-700 font-semibold dark:from-sky-500/20 dark:to-amber-500/20 dark:text-sky-200">
                  <time dateTime={ev.startDate} className="text-sm">
                    <span className="block text-xs">
                      {startDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                      })}
                    </span>
                    <span className="block text-[12px]">
                      {startDate.toLocaleDateString("pt-BR", {
                        month: "short",
                      })}
                    </span>
                  </time>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                    {ev.title}
                  </h3>
                  <p className="mt-1 text-[13px] text-gray-600 line-clamp-2 dark:text-neutral-400">
                    {ev.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400">
                <span>{formatDateRange(ev.startDate, ev.endDate)}</span>
                {ev.location && (
                  <span className="truncate" title={ev.location}>
                    {ev.location}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
