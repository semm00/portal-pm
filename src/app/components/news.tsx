import Image from "next/image";
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

// TODO: Substituir por fetch do back-end quando a API estiver disponível
// Ex.: const res = await fetch(process.env.NEWS_API_URL + '/news?limit=8', { cache: 'no-store' })
//      const items: NewsItem[] = await res.json();
async function getNews(): Promise<NewsItem[]> {
  // Mock inicial (ordem decrescente por data)
  const mock: NewsItem[] = [
    {
      id: "n1",
      title: "Obras de infraestrutura avançam em Padre Marcos",
      url: "https://exemplo.site/noticia/obras-infraestrutura",
      imageUrl: "/images/bandeira-municipio.jpg",
      source: "Portal Externo",
      publishedAt: "2025-09-20T10:30:00Z",
    },
    {
      id: "n2",
      title: "Campanha de vacinação atinge meta no município",
      url: "https://exemplo.site/noticia/vacinacao-meta",
      imageUrl: "/images/slide-1.jpg",
      source: "Agência Saúde",
      publishedAt: "2025-09-19T09:00:00Z",
    },
    {
      id: "n3",
      title: "Evento cultural reúne artistas locais",
      url: "https://exemplo.site/noticia/evento-cultural",
      imageUrl: "/images/slide-2.jpg",
      source: "Cultura News",
      publishedAt: "2025-09-18T18:10:00Z",
    },
    {
      id: "n4",
      title: "Educação: novo programa de apoio aos estudantes",
      url: "https://exemplo.site/noticia/apoio-estudantes",
      imageUrl: "/images/slide-3.png",
      source: "Educa+",
      publishedAt: "2025-09-17T12:00:00Z",
    },
    {
      id: "n5",
      title: "Turismo: rota ecológica é destaque regional",
      url: "https://exemplo.site/noticia/rota-ecologica",
      imageUrl: "/images/slide-1.jpg",
      source: "Viagens Hoje",
      publishedAt: "2025-09-16T15:20:00Z",
    },
    {
      id: "n6",
      title: "Agronegócio: feira movimenta a economia local",
      url: "https://exemplo.site/noticia/feira-agronegocio",
      imageUrl: "/images/slide-2.jpg",
      source: "Agro Brasil",
      publishedAt: "2025-09-15T08:45:00Z",
    },
    {
      id: "n7",
      title: "Saúde: novo posto é inaugurado no bairro",
      url: "https://exemplo.site/noticia/novo-posto",
      imageUrl: "/images/bandeira-municipio.jpg",
      source: "Agência Saúde",
      publishedAt: "2025-09-14T11:05:00Z",
    },
    {
      id: "n8",
      title: "Empreendedorismo: capacitação gratuita para MEIs",
      url: "https://exemplo.site/noticia/capacitacao-mei",
      imageUrl: "/images/slide-3.png",
      source: "Economia +",
      publishedAt: "2025-09-13T17:40:00Z",
    },
  ];

  // ordena do mais recente para o mais antigo
  const sorted = mock.sort((a, b) => {
    const da = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const db = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return db - da;
  });
  return sorted;
}

export default async function News() {
  const items = await getNews();

  if (!items || items.length === 0) {
    return (
      <section aria-labelledby="news-heading" className="py-6">
        <h2
          id="news-heading"
          className="text-lg font-semibold text-[#0b203a] dark:text-[#0a4ea1]"
        >
          Últimas Notícias
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-300">
          Nenhuma notícia disponível no momento.
        </p>
      </section>
    );
  }

  const display = items.slice(0, 8);

  return (
    <section aria-labelledby="news-heading" className="py-6">
      <h2
        id="news-heading"
        className="mb-4 text-xl font-bold text-[#0b203a] dark:text-[#0a4ea1]"
      >
        Últimas Notícias
      </h2>

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
            className={[
              "group block overflow-hidden rounded-xl border shadow-sm transition hover:shadow-md",
              "bg-white border-gray-200 hover:border-gray-300 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-600",
            ].join(" ")}
          >
            <div className="relative aspect-[16/10] w-full">
              {n.imageUrl ? (
                <Image
                  src={n.imageUrl}
                  alt={n.title}
                  fill
                  sizes="25vw"
                  className="object-cover"
                  priority={idx < 3}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-amber-100 dark:from-neutral-800 dark:to-neutral-700" />
              )}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-[#0a4ea1] dark:text-white dark:group-hover:text-amber-300">
                {n.title}
              </h3>
              {n.source && (
                <p className="mt-1 text-[11px] text-gray-500 dark:text-neutral-400">
                  {n.source}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
