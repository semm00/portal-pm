import Image from "next/image";
import { buildApiUrl } from "@/lib/api";
import NewsCarousel from "./news-carousel";

// Tipagem das notícias para futura integração com o back-end
export type NewsItem = {
  id: string;
  title: string;
  url: string; // link externo (abre em nova aba)
  imageUrl?: string; // opcional — se não vier, usamos um placeholder
  source?: string; // opcional: nome do site
  publishedAt?: string; // ISO date
};

type NewsApiItem = {
  id: string;
  title: string;
  source?: string | null;
  url: string;
  imageUrl?: string | null;
  createdAt?: string | null;
};

type NewsApiResponse = {
  success?: boolean;
  news?: NewsApiItem[];
};

async function getNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch(buildApiUrl("/api/news"), {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error("Falha ao carregar notícias", response.statusText);
      return [];
    }

    const data: NewsApiResponse = await response.json();

    if (!data?.news || !Array.isArray(data.news)) {
      return [];
    }

    return data.news.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl ?? undefined,
      source: item.source ?? undefined,
      publishedAt: item.createdAt ?? undefined,
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias", error);
    return [];
  }
}

export default async function News() {
  const items = await getNews();

  if (!items || items.length === 0) {
    return (
      <section aria-labelledby="news-heading" className="py-6">
        <h1
          id="news-heading"
          className="text-lg font-semibold text-[#0b203a] dark:text-[#0a4ea1]"
        >
          Últimas Notícias
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-300">
          Nenhuma notícia disponível no momento.
        </p>
      </section>
    );
  }

  const display = items.slice(0, 8);

  return (
    <section
      aria-labelledby="news-heading"
      className="px-5 sm:px-8 md:px-10 py-6 bg-[#ecececad]"
    >
      <h1
        id="news-heading"
        className="mb-4 text-xl font-bold text-[#0b203a] dark:text-[#0a4ea1] border-b-3 border-[#0a4ea1]pb-1 w-fit"
      >
        Últimas Notícias
      </h1>

      {/* Carrossel (sm/md) com 2 cards por vez */}
      <div className="lg:hidden">
        <NewsCarousel items={display} />
      </div>

      {/* Grid (desktop) 4x2, imagens menos altas */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {display.map((n, idx) => (
          <a
            key={n.id}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={n.title}
            className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-transform hover:shadow-md hover:-translate-y-1"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              color: "#1f2937",
            }}
          >
            <div className="relative aspect-[16/10] w-full mb-3">
              {n.imageUrl ? (
                <Image
                  src={n.imageUrl}
                  alt={n.title}
                  fill
                  sizes="25vw"
                  className="object-cover rounded-lg"
                  priority={idx < 3}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-sky-200 to-amber-200 rounded-lg" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-[#0a4ea1]">
                {n.title}
              </h3>
              {n.source && (
                <p className="mt-1 text-[11px] text-gray-500">{n.source}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
