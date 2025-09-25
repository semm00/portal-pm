"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { NewsItem } from "./news";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function NewsCarousel({ items }: { items: NewsItem[] }) {
  // Mostra 2 por vez em telas menores
  const slides = useMemo(() => items.slice(0, 8), [items]);
  const [index, setIndex] = useState(0); // índice da pagina (0-based)

  const totalPages = Math.max(1, Math.ceil(slides.length / 2));
  const clampedIndex = Math.min(index, totalPages - 1);

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(totalPages - 1, i + 1));

  const pageItems = slides.slice(clampedIndex * 2, clampedIndex * 2 + 2);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={[
                "h-1.5 w-4 rounded-full transition-all",
                i === clampedIndex
                  ? "bg-[#0a4ea1] w-6"
                  : "bg-gray-300 dark:bg-neutral-700",
              ].join(" ")}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Anterior"
            disabled={clampedIndex === 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo"
            disabled={clampedIndex === totalPages - 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {pageItems.map((n, idx) => (
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
                  sizes="50vw"
                  className="object-cover"
                  priority={idx < 2}
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
    </div>
  );
}
