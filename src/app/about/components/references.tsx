"use client";

export default function References() {
  return (
    <section className="bg-[#0b203a] py-12 px-5 text-white transition-colors duration-300 dark:bg-slate-900 dark:text-neutral-100 sm:px-8 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-white dark:text-neutral-50 md:text-left">
          Referências
        </h2>
        <ol className="list-inside list-decimal space-y-4 text-sm text-white/80 marker:text-[#fca311] dark:text-neutral-300">
          <li>
            <span className="italic">«Padre Marcos».</span>{" "}
            <a
              href="https://cidades.ibge.gov.br/brasil/pi/padre-marcos/panorama"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fca311] underline transition-colors hover:text-[#fca311]/80"
            >
              IBGE Cidades
            </a>
            . Consultado em 25 de setembro de 2025.
          </li>
          <li>
            <span className="italic">
              «Raízes de Padre Marcos: memórias e legado dos que sonharam e
              construíram»
            </span>
            . Autor: Valdo Benedito.
          </li>
        </ol>
      </div>
    </section>
  );
}
