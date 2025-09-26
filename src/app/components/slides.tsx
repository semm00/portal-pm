"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  src: string;
  alt: string;
  caption: string;
};

const SLIDE_INTERVAL = 5000; // 8s

export default function Slides() {
  const slides: Slide[] = useMemo(
    () => [
      {
        src: "/images/slide-1.jpg",
        alt: "Bem-vindo(a)",
        caption: "Bem-vindo(a)!",
      },
      {
        src: "/images/slide-2.jpg",
        alt: "Padre Marcos - PI",
        caption: "Padre Marcos - PI",
      },
      {
        src: "/images/slide-3.png",
        alt: "Terra da Boa Esperança",
        caption: "Terra da Boa Esperança",
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // autoplay
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  return (
    <section
      aria-label="Slideshow"
      className="relative w-full overflow-hidden rounded-xl"
    >
      <div className="relative aspect-[16/9] w-full max-h-[50vh]">
        {slides.map((s, i) => {
          const isActive = i === index;
          return (
            <div
              key={s.src}
              className={`absolute inset-0 transition-opacity duration-700 ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 100vw"
                className="object-cover"
              />
              {/* overlay escura para destacar o texto */}
              <div className="absolute inset-0 bg-black/40" />
              {/* texto central */}
              <div className="absolute inset-0 grid place-items-center p-4">
                <h2 className="text-white text-2xl sm:text-3xl md:text-5xl font-extrabold drop-shadow-lg text-center">
                  {s.caption}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* indicadores (bolinhas) */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Ir para o slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
