"use client";

export default function References() {
  return (
    <section className="py-12 px-5 sm:px-8 md:px-10 bg-[#0b203a] text-white">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center md:text-left">
          Referências
        </h2>
        <ol className="list-decimal list-inside space-y-4 text-sm text-white/80 marker:text-[#fca311]">
          <li>
            <span className="italic">«Padre Marcos».</span>{" "}
            <a
              href="https://cidades.ibge.gov.br/brasil/pi/padre-marcos/panorama"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fca311] hover:text-[#fca311]/80 underline"
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
