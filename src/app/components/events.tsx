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

async function getEvents(): Promise<EventItem[]> {
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

    return events
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
  } catch (error) {
    console.error(error);
    return [];
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
      className="px-5 sm:px-8 md:px-10 py-6"
    >
      <h2
        id="events-heading"
        className="mb-4 text-xl font-bold text-[#0a4ea1] border-b-2 border-[#0a4ea1] pb-1 w-fit"
      >
        Próximos Eventos
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {display.length === 0 && (
          <p className="col-span-full rounded-lg border border-dashed border-slate-300 bg-slate-50 py-6 text-center text-sm text-slate-500">
            Nenhum evento aprovado foi encontrado. Volte em breve!
          </p>
        )}
        {display.map((ev) => {
          const startDate = new Date(ev.startDate);
          const endDate = new Date(ev.endDate);

          return (
            <article
              key={ev.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e5e7eb",
                color: "#1f2937",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-sky-200 to-amber-200 text-sky-700 font-semibold">
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
                  <h3 className="text-sm font-semibold text-slate-900">
                    {ev.title}
                  </h3>
                  <p className="mt-1 text-[13px] text-gray-600 line-clamp-2">
                    {ev.description}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
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
