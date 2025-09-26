import React from "react";

export type EventItem = {
  id: string;
  date: string; // ISO date
  title: string;
  description?: string;
  location?: string;
};

// Mock temporário — substituir por fetch para a API quando disponível
async function getEvents(): Promise<EventItem[]> {
  const mock: EventItem[] = [
    {
      id: "e1",
      date: "2025-10-05T18:00:00Z",
      title: "Festa da Cultura Local",
      description:
        "Apresentações musicais, comidas típicas e feira de artesanato.",
      location: "Praça Central",
    },
    {
      id: "e2",
      date: "2025-10-12T08:00:00Z",
      title: "Corrida Rústica 5K",
      description:
        "Inscrições abertas para todas as idades. Premiação para os 3 primeiros.",
      location: "Parque Municipal",
    },
    {
      id: "e3",
      date: "2025-10-20T19:30:00Z",
      title: "Concerto da Orquestra Jovem",
      description: "Concerto com repertório clássico e popular.",
      location: "Teatro Municipal",
    },
    {
      id: "e4",
      date: "2025-11-03T09:00:00Z",
      title: "Feira de Empreendedorismo",
      description: "Oficinas e palestras para microempreendedores locais.",
      location: "Centro de Convenções",
    },
  ];

  // ordena por data crescente (próximos eventos primeiro)
  return mock.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function Events() {
  const items = await getEvents();
  const display = items.slice(0, 4);

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
        {display.map((ev) => (
          <article
            key={ev.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              color: "#1f2937",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-sky-200 to-amber-200 text-sky-700 font-semibold">
                <time dateTime={ev.date} className="text-sm">
                  <span className="block text-xs">
                    {new Date(ev.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                    })}
                  </span>
                  <span className="block text-[12px]">
                    {new Date(ev.date).toLocaleDateString("pt-BR", {
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
              <span>{formatDate(ev.date)}</span>
              {ev.location && <span className="truncate">{ev.location}</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
