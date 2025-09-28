"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

interface Mayor {
  image: string;
  name: string;
  mandate: string;
  tooltip: string;
}

const getImageSrc = (imageName: string) => {
  // return base path without extension; ImageWithFallback will probe extensions
  return `/images/${imageName}`;
};

const ImageWithFallback: React.FC<{
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({
  src,
  alt,
  width,
  height,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const fallbackSrc = "/images/placeholder.svg";
  const sourceCandidates = useMemo(() => {
    const exts = [".jpg", ".jpeg", ".png", ".webp"];
    const unique = Array.from(
      new Set(exts.map((ext) => `${src}${ext}`).concat(fallbackSrc))
    );
    return unique;
  }, [src, fallbackSrc]);

  const [attemptIndex, setAttemptIndex] = useState(0);

  useEffect(() => {
    setAttemptIndex(0);
  }, [src]);

  const currentSrc = sourceCandidates[attemptIndex] ?? fallbackSrc;
  const isLastAttempt = attemptIndex >= sourceCandidates.length - 1;

  const handleError = () => {
    setAttemptIndex((prev) => {
      if (prev >= sourceCandidates.length - 1) {
        return prev;
      }
      return prev + 1;
    });
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onError={handleError}
      loading="lazy"
      unoptimized={isLastAttempt && currentSrc === fallbackSrc}
    />
  );
};

const mayors: Mayor[] = [
  {
    image: "wiliane-kelly",
    name: "Wiliane Kelly",
    mandate: "2025-Atual",
    tooltip:
      "Wiliane Kelly, do PSD, foi eleita prefeita de Padre Marcos (PI) para os próximos quatro anos. Ao fim da apuração, Wiliane Kelly teve 4.328 votos, 84,76% dos votos válidos. Com maioria de 3550 votos.",
  },
  {
    image: "valdinar-silva",
    name: "Valdinar Silva",
    mandate: "2021-2024",
    tooltip:
      "José Valdinar da Silva (PSD) se elege novamente prefeito de Padre Marcos (PI) juntamente com o vice-prefeito Valdo Benedito. Obteve 69,01% dos votos válidos, um total de 3.390 votos, na eleição de 2020.",
  },
  {
    image: "valdinar-silva",
    name: "Valdinar Silva",
    mandate: "2017-2020",
    tooltip:
      "A 14ª eleição aconteceu no dia 2 de outubro de 2016, entre três candidatos a prefeito: José de Fátima Araújo Leal - Zé Melado (PMDB), ex-prefeito, tendo como candidato a vice o então Vereador Juvanir Antônio de Macedo, do mesmo partido; Waldemar Macedo Neto (PP), médico, tendo como companheiro de chapa o então Vereador Roberval Conrado Lima (PR); José Valdinar da Silva (PSB), ex-presidente do Sindicato dos Trabalhadores Rurais de Padre Marcos-PI, tendo como candidato a vice-prefeito Valdo Benedito da Silva (PSD).",
  },
  {
    image: "lucinete-macedo",
    name: "Lucinete Macedo (Netinho)",
    mandate: "2013-2016",
    tooltip:
      "A aconteceu a 13ª eleição em 7 de outubro de 2012, entre dois candidatos: Lucinete Macedo Araújo (PMDB), candidato da situação, tendo como candidato a vice-prefeito o ex-presidente do Sindicato dos Trabalhadores Rurais de Padre Marcos, José Valdinar da Silva (PSB) e Valdo Benedito da Silva (PSC), pela oposição, com GG Macedo, indicado pelo PTB, candidato a vice-prefeito.",
  },
  {
    image: "ze-melado",
    name: "José de Fátima (Zé Melado)",
    mandate: "2009-2012",
    tooltip:
      "Esta 12ª eleição realizou-se em outubro de 2008, com três candidatos concorrendo a prefeito, a saber: José de Fátima Araújo Leal (PMDB), candidato à reeleição, tendo como candidato a vice-prefeito Wálter Pereira Soares Júnior (PTB), filho da Dra. Neide e do Dr. Walter; Raimundo Francisco Vieira (PP), advogado e ex-prefeito, tendo como candidato a vice-prefeito o vereador Roberval Conrado Lima (PSB); Valdo Benedito da Silva (PSC), tendo como candidato a vice Zé de Aguinane (PSC), do Riacho.",
  },
  {
    image: "ze-melado",
    name: "José de Fátima (Zé Melado)",
    mandate: "2005-2008",
    tooltip:
      "Pela primeira vez na história política de Padre Marcos, três candidatos concorrem para prefeito. José de Fátima e Valdo Benedito venceram a eleição com 56 votos de maioria, para um mandato de 4 anos (2005/2008), sobre o segundo concorrente, o advogado Raimundo Vieira (PP).",
  },
  {
    image: "neide-macedo",
    name: "Dra. Neide Macedo",
    mandate: "2001-2004",
    tooltip:
      "A 10ª eleição ocorreu no final do ano 2000, com dois candidatos a Prefeito: Dra. Neide Macedo (ex-prefeita), pelo PFL (Carecas), candidata da situação, tendo como candidato a vice-prefeito o então Vereador Valdo Benedito da Silva (PDT).",
  },
  {
    image: "raimundo-vieira",
    name: "Dr. Raimundo Vieira",
    mandate: "1997-2000",
    tooltip:
      "Em outubro de 1996, é realizada a 9ª eleição direta para Prefeito de Pe. Marcos, com dois candidatos na disputa: o advogado Raimundo Francisco Vieira-PFL, candidato da situação, com apoio da Prefeita Dra. Neide e do grupo, tendo como candidato a vice-Prefeito o então estudante 'Careca', Williams Macêdo, sobrinho da Dra. Neide e com apoio do Mazim.",
  },
  {
    image: "neide-macedo",
    name: "Dra. Neide Macedo",
    mandate: "1993-1996",
    tooltip:
      "A 8ª eleição ocorreu em outubro de 1992 entre dois candidatos a Prefeito: pelo PFL (Careca), concorreu ao pleito a candidata Dra. Neide Macêdo, tendo como candidato a vice-Prefeito Osmar Dias de Alencar, seu irmão (PDT). Dra. Neide vence a eleição para um mandato de 4 anos, ou seja, 1993/1996, com maioria de 1.301 votos.",
  },
  {
    image: "afonso-moura",
    name: "Afonso Moura",
    mandate: "1989-1992",
    tooltip:
      "Do lado dos 'Carecas' (agora PFL), o candidato a Prefeito foi o então Vice-Prefeito Afonso Moura Macêdo, tendo como candidato a Vice-Prefeito o médico Antônio Moura de Araújo. Afonso Moura e Dr. Antônio vencem as eleições para o quatriênio: 1989/1992 com uma maioria de 850 votos.",
  },
  {
    image: "francisco-macedo",
    name: "Dr. Francisco Macedo",
    mandate: "1983-1988",
    tooltip:
      "Francisco Luiz de Macedo e Afonso Moura Macedo vencem a eleição para Prefeito para um mandato de seis anos, ou seja, para administrar o município de Padre Marcos de 1983 a 1988, encerrando assim um ciclo de poder político local do grupo 'Cheleléu', que dominou a Prefeitura Municipal com o apoio e a força política do deputado estadual Humberto Reis da Silveira por exatos 16 anos.",
  },
  {
    image: "vitor-macedo-2",
    name: "Vitor Macedo",
    mandate: "1977-1982",
    tooltip:
      "Concorrendo pelo partido da Arena 1, candidato a Prefeito Vitor Antônio de Macédo (Vitinho), teve como candidato a vice-prefeito Israel Antão de Alencar, o Helinho da Canabrava, pelo grupo dos 'Cheleléus'. Vitinho e Helinho ganharam a eleição, obtendo 1.645 votos, e administraram o município de Padre Marcos por seis anos, de 1977 a 1982. Dr. Francisco e Zezito obtiveram 1.245 sufrágios.",
  },
  {
    image: "jose-jubelino",
    name: "José Jubelino",
    mandate: "1973-1976",
    tooltip:
      "A quarta eleição de Padre Marcos aconteceu no final do ano de 1972, com a candidatura única de José Jubelino de Macedo (Dr. Luiz), tendo como candidato a Vice José Bento Sobrinho. Dr. Luiz vence a eleição com 1.596 votos, contra 1.594 sufrágios em branco, ou seja, dr. Luiz se elege prefeito com apenas 2 votos de maioria sobre os votos em branco da campanha de Mazim.",
  },
  {
    image: "vitor-macedo",
    name: "Vitor Macedo",
    mandate: "1971-1972",
    tooltip:
      "A Terceira Eleição para Prefeito em Padre Marcos aconteceu no final do ano de 1970, sendo disputada entre dois candidatos: Vitor Antônio de Macedo, que teve como candidato a vice Osmar Dias de Alencar e José de Moura Leal, tendo como candidato a vice João Guabiraba.",
  },
  {
    image: "vicente-oliveira",
    name: "Vicente Oliveira",
    mandate: "1967-1970",
    tooltip:
      "A segunda eleição aconteceu no final do ano de 1966 entre o comerciante Vicente Oliveira Lobo, tendo como candidato a Vice-Prefeito o também comerciante e ex-prefeito nomeado Anísio Bento de Carvalho, para uma gestão de 4 anos, ou seja, de 1967 a 1970.",
  },
  {
    image: "zezito-moura",
    name: "José de Moura (Zezito)",
    mandate: "1965-1966",
    tooltip:
      "Em 27 de dezembro de 1964, acontece a primeira eleição direta em Padre Marcos. Mas, antes, as lideranças locais que de costume se reuniam para combinar estratégias, concordaram que José de Moura Leal deveria ser o Primeiro Prefeito, e escolheram o comerciante Vicente Oliveira Lobo para candidato a Vice-Prefeito. E assim aconteceu.",
  },
];

export default function MayorLine() {
  const [selectedTooltip, setSelectedTooltip] = useState<string | null>(null);

  return (
    <section className="py-12 px-5 sm:px-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
          Todos os Prefeitos de Padre Marcos
        </h2>
        <p className="text-center text-xs text-gray-500 mb-6">
          clique ou passe o mouse para mais informações
        </p>

        {/* Desktop: Timeline vertical */}
        <div className="hidden md:block relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-[#17447a] h-full"></div>
          <div className="space-y-4">
            {mayors.map((mayor, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? "pr-8" : "pl-8"}`}>
                  <div className="relative">
                    <div
                      className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
                      onMouseEnter={() => setSelectedTooltip(`${index}`)}
                      onMouseLeave={() => setSelectedTooltip(null)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <ImageWithFallback
                            src={getImageSrc(mayor.image)}
                            alt={mayor.name}
                            width={96}
                            height={128}
                            className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity w-24 h-32"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {mayor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {mayor.mandate}
                          </p>
                        </div>
                      </div>
                    </div>
                    {selectedTooltip === `${index}` && (
                      <div
                        className={`absolute bottom-full mb-3 bg-gray-800 text-white text-sm rounded-lg shadow-xl p-4 transform z-50 max-w-[min(42vw,22rem)] w-max text-left whitespace-pre-line ${
                          index % 2 === 0
                            ? "right-0 translate-x-1/2 origin-top-right"
                            : "left-0 -translate-x-1/2 origin-top-left"
                        }`}
                      >
                        <div className="font-semibold mb-1">{mayor.name}</div>
                        <div className="text-xs text-gray-100">
                          {mayor.tooltip}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-4 h-4 bg-[#17447a] rounded-full border-4 border-white shadow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Carousel horizontal */}
        <div className="md:hidden">
          <div className="overflow-x-auto overflow-visible pb-4">
            <div className="flex space-x-2 px-2">
              {mayors.map((mayor, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-64 bg-white rounded-lg shadow-lg p-4 border border-gray-200"
                  onClick={() =>
                    setSelectedTooltip(
                      selectedTooltip === `mobile-${index}`
                        ? null
                        : `mobile-${index}`
                    )
                  }
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <ImageWithFallback
                        src={getImageSrc(mayor.image)}
                        alt={mayor.name}
                        width={128}
                        height={160}
                        className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity w-32 h-40"
                      />
                      {/* mobile tooltips rendered as a single fixed overlay to avoid page vertical scrollbars */}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      {mayor.name}
                    </h3>
                    <p className="text-xs text-gray-600">{mayor.mandate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Mobile overlay for tooltips: render once to avoid per-card absolute tooltips that expand page height */}
      {selectedTooltip &&
        selectedTooltip.startsWith("mobile-") &&
        (() => {
          const idx = parseInt(selectedTooltip.replace("mobile-", ""), 10);
          const mayor = mayors[idx];
          return (
            <div className="fixed inset-0 flex items-end justify-center pointer-events-none z-[120]">
              <div className="pointer-events-auto mb-6 mx-4 w-full max-w-3xl">
                <div className="bg-gray-800 text-white text-sm rounded-lg p-4 shadow-lg max-h-[60vh] overflow-auto">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">{mayor.name}</div>
                    <button
                      onClick={() => setSelectedTooltip(null)}
                      className="text-gray-200 hover:text-white ml-4"
                      aria-label="Fechar"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-xs text-gray-100 whitespace-pre-line">
                    {mayor.tooltip}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </section>
  );
}
