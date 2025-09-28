"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";

// hymns list removed — o componente mostra apenas o hino principal

export default function Info() {
  const [expanded, setExpanded] = useState(false);
  const [expandedHistoria, setExpandedHistoria] = useState(false);
  const [expandedPovoados, setExpandedPovoados] = useState(false);
  const [expandedHino, setExpandedHino] = useState(false);
  const [expandedHinoText, setExpandedHinoText] = useState(false);
  const [expandedConsideracoes, setExpandedConsideracoes] = useState(false);

  return (
    <section className="px-5 sm:px-8 md:px-10 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: content */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Padre Marcos
            </h1>

            <p className="text-[15px] text-gray-700 mb-4">
              Padre Marcos é um município brasileiro, do estado do Piauí,
              distante 387 km de sua capital, Teresina. Localiza-se a uma
              latitude 07º21&apos;18&quot; sul e a uma longitude
              40º54&apos;16&quot; oeste, estando a uma altitude de 360 metros.
              Sua população estimada em 2022 foi de 6.382 habitantes, segundo o
              IBGE. Possui uma área de 278,696 km².
            </p>

            <div className="hidden md:block">
              <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-2">
                História
              </h2>
              <p className="text-[15px] text-gray-700 mb-4 whitespace-pre-line">
                O Município de Padre Marcos, localizado na região sudeste do
                Estado do Piauí, na microrregião do Alto Médio Canindé, teve
                origem na Fazenda Boa Esperança, de propriedade do Padre Marcos
                de Araújo Costa, que a herdou do seu pai, Marcos
                Francisco de Araújo Costa. Nessa época, pertencia ao município
                de Jaicós. O Padre Marcos fixou residência na fazenda Boa
                Esperança por volta do ano de 1820, para continuar a missão
                educacional do seu pai, Marcos Francisco, com uma escola
                gratuita para alunos que vinham de vários recantos. Construiu
                diversas casas para colonos e também uma Capela, hoje Igreja
                Matriz. Em 1914, a Fazenda Boa Esperança foi elevada à categoria
                de Povoado. Padre Marcos tornou-se município através da Lei
                2.566 de 2 de janeiro de 1964, sendo instalado oficialmente em
                17 de janeiro do mesmo ano. Foi nomeado o primeiro prefeito, o
                comerciante Anísio Bento de Carvalho, que administrou pelo
                período de um ano. O governador da época era Petrônio Portella.
                O primeiro Prefeito eleito foi José de Moura Leal, que foi
                candidato único e governou Padre Marcos por dois anos: 1965/66.
                Hoje a sede da Prefeitura, em sua homenagem, foi denominada de
                &quot;Palácio Prefeito Zezito Moura&quot;, conforme Lei
                municipal de 2006, de autoria da Vereadora Lucimária Moura, sua
                neta.
              </p>
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setExpandedHistoria((prev) => !prev)}
                className="flex w-full items-center justify-between mt-6 mb-2 rounded-lg px-2 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a4ea1]/60 hover:bg-slate-100"
                aria-expanded={expandedHistoria}
              >
                <span className="text-left text-xl font-semibold text-slate-900">
                  História
                </span>
                {expandedHistoria ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedHistoria && (
                <p className="text-[15px] text-gray-700 mb-4 whitespace-pre-line">
                  O Município de Padre Marcos, localizado na região sudeste do
                  Estado do Piauí, na microrregião do Alto Médio Canindé, teve
                  origem na Fazenda Boa Esperança, de propriedade do Padre
                  Marcos de Araújo Costa, que a herdou do seu pai, o português
                  Marcos Francisco de Araújo Costa. Nessa época, pertencia ao
                  município de Jaicós. O Padre Marcos fixou residência na
                  fazenda Boa Esperança por volta do ano de 1820, para continuar
                  a missão educacional do seu pai, Marcos Francisco, com uma
                  escola gratuita para alunos que vinham de vários recantos.
                  Construiu diversas casas para colonos e também uma Capela,
                  hoje Igreja Matriz. Em 1914, a Fazenda Boa Esperança foi
                  elevada à categoria de Povoado. Padre Marcos tornou-se
                  município através da Lei 2.566 de 2 de janeiro de 1964, sendo
                  instalado oficialmente em 17 de janeiro do mesmo ano. Foi
                  nomeado o primeiro prefeito, o comerciante Anísio Bento de
                  Carvalho, que administrou pelo período de um ano. O governador
                  da época era Petrônio Portella. O primeiro Prefeito eleito foi
                  José de Moura Leal, que foi candidato único e governou Padre
                  Marcos por dois anos: 1965/66. Hoje a sede da Prefeitura, em
                  sua homenagem, foi denominada de &quot;Palácio Prefeito Zezito
                  Moura&quot;, conforme Lei municipal de 2006, de autoria da
                  Vereadora Lucimária Moura, sua neta.
                </p>
              )}
            </div>

            <div className="hidden md:block">
              <h3 className="text-lg font-medium mt-4 mb-2">Povoados</h3>
              <p className="text-[15px] text-gray-700">
                Riacho do Padre, Casa Nova, Jurema, Curral Velho, Barra, Canto
                Alegre.
              </p>
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setExpandedPovoados((prev) => !prev)}
                className="flex w-full items-center justify-between mt-4 mb-2 rounded-lg px-2 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a4ea1]/60 hover:bg-slate-100"
                aria-expanded={expandedPovoados}
              >
                <span className="text-left text-lg font-medium">Povoados</span>
                {expandedPovoados ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedPovoados && (
                <p className="text-[15px] text-gray-700">
                  Riacho do Padre, Casa Nova, Jurema, Curral Velho, Barra, Canto
                  Alegre.
                </p>
              )}
            </div>

            <div className="hidden md:block">
              <h3 className="text-lg font-medium mt-6 mb-1">Hino</h3>
              <p className="text-sm text-gray-600 mb-3">
                Autor: Antônio Gomes de Sousa &quot;Jurdan&quot;
              </p>

              <div className="prose max-w-none text-gray-800">
                <div className="mt-2 p-3 bg-slate-50 rounded">
                  <audio controls className="w-full mb-3">
                    <source src="/hino-oficial.mp3" type="audio/mpeg" />
                    Seu navegador não suporta o elemento de áudio.
                  </audio>

                  <div className="text-sm text-slate-800 whitespace-pre-line">
                    {!expanded ? (
                      <>
                        {`Em tempos idos, a bravura foi mostrada,
Na terra amada que desfralda seu pendão;
Traz seus legados como fonte inspiradora,
Tão geradora da riqueza deste chão.

Naquele tempo, a escola Boa Esperança,
Mostrou pujança fomentando bom saber;
Foi primazia orgulhando o nosso Estado,
É um passado que ninguém deve esquecer.`}
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setExpanded(true)}
                            className="text-sm text-[#0a4ea1] underline hover:text-[#08326b] transition-colors px-2 py-1 -mx-2 rounded min-h-[44px] flex items-center"
                          >
                            Ver mais
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {`Em tempos idos, a bravura foi mostrada,
Na terra amada que desfralda seu pendão;
Traz seus legados como fonte inspiradora,
Tão geradora da riqueza deste chão.
É muita glória oriunda do passado,
Prodígio dado feito por bem merecer;
História digna que merece ser contada,
Da pátria amada que orgulha eu e você.

Naquele tempo, a escola Boa Esperança,
Mostrou pujança fomentando bom saber;
Foi primazia orgulhando o nosso Estado,
É um passado que ninguém deve esquecer.
A Padre Marcos tão fecunda encantadora,
Tão promissora devido a seu benfeitor;
O bom político sacerdote inteligente,
O sapiente benemérito educador.

A casa grande de adobes avarandada,
Brisa aromada da videira do Pomar;
Suas paredes rebocadas bem caiadas
De Tabatinga argila sedimentar.

Foi essa escola, o berço da educação,
Brilho e razão que esposo notoriedade;
Sua influência foi compensatória,
Dando a história grandes personalidades.
Neste compasso, seu povo tomou a frente,
Tão persistente corajoso para lutar;
Nem circunstâncias por força da natureza,
Mostrou destreza para o labor evitar.

Sua cultura de Caju, milho e feijão,
O algodão alvorecendo o campeiro;
Já a caatinga mostrando grande secura,
Dando bravura da labuta do vaqueiro.
Os que te amam agem com patriotismo,
Erguem civismo cada um por te amar;
Tomam a vanguarda externando o bem querer,
No florescer de um progresso que virá.

A Padre Marcos, nossa terra, nosso chão,
Meu coração por ti pulsa com fervor;
Cidade amada detentora do meu ser,
Me dá prazer externar todo este amor. (repete)`}
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setExpanded(false)}
                            className="text-sm text-[#0a4ea1] underline hover:text-[#08326b] transition-colors px-2 py-1 -mx-2 rounded min-h-[44px] flex items-center"
                          >
                            Ver menos
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setExpandedHino((prev) => !prev)}
                className="flex w-full items-center justify-between mt-6 mb-1 rounded-lg px-2 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a4ea1]/60 hover:bg-slate-100"
                aria-expanded={expandedHino}
              >
                <span className="text-left text-lg font-medium">Hino</span>
                {expandedHino ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedHino && (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Autor: Antônio Gomes de Sousa &quot;Jurdan&quot;
                  </p>

                  <div className="prose max-w-none text-gray-800">
                    <div className="mt-2 p-3 bg-slate-50 rounded">
                      <audio controls className="w-full mb-3">
                        <source src="/hino-oficial.mp3" type="audio/mpeg" />
                        Seu navegador não suporta o elemento de áudio.
                      </audio>

                      <div className="text-sm text-slate-800 whitespace-pre-line">
                        {!expandedHinoText ? (
                          <>
                            {`Em tempos idos, a bravura foi mostrada,
Na terra amada que desfralda seu pendão;
Traz seus legados como fonte inspiradora,
Tão geradora da riqueza deste chão.

Naquele tempo, a escola Boa Esperança,
Mostrou pujança fomentando bom saber;
Foi primazia orgulhando o nosso Estado,
É um passado que ninguém deve esquecer.`}
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => setExpandedHinoText(true)}
                                className="text-sm text-[#0a4ea1] underline hover:text-[#08326b] transition-colors px-2 py-1 -mx-2 rounded min-h-[44px] flex items-center"
                              >
                                Ver mais
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {`Em tempos idos, a bravura foi mostrada,
Na terra amada que desfralda seu pendão;
Traz seus legados como fonte inspiradora,
Tão geradora da riqueza deste chão.
É muita glória oriunda do passado,
Prodígio dado feito por bem merecer;
História digna que merece ser contada,
Da pátria amada que orgulha eu e você.

Naquele tempo, a escola Boa Esperança,
Mostrou pujança fomentando bom saber;
Foi primazia orgulhando o nosso Estado,
É um passado que ninguém deve esquecer.
A Padre Marcos tão fecunda encantadora,
Tão promissora devido a seu benfeitor;
O bom político sacerdote inteligente,
O sapiente benemérito educador.

A casa grande de adobes avarandada,
Brisa aromada da videira do Pomar;
Suas paredes rebocadas bem caiadas
De Tabatinga argila sedimentar.

Foi essa escola, o berço da educação,
Brilho e razão que esposo notoriedade;
Sua influência foi compensatória,
Dando a história grandes personalidades.
Neste compasso, seu povo tomou a frente,
Tão persistente corajoso para lutar;
Nem circunstâncias por força da natureza,
Mostrou destreza para o labor evitar.

Sua cultura de Caju, milho e feijão,
O algodão alvorecendo o campeiro;
Já a caatinga mostrando grande secura,
Dando bravura da labuta do vaqueiro.
Os que te amam agem com patriotismo,
Erguem civismo cada um por te amar;
Tomam a vanguarda externando o bem querer,
No florescer de um progresso que virá.

A Padre Marcos, nossa terra, nosso chão,
Meu coração por ti pulsa com fervor;
Cidade amada detentora do meu ser,
Me dá prazer externar todo este amor. (repete)`}
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => setExpandedHinoText(false)}
                                className="text-sm text-[#0a4ea1] underline hover:text-[#08326b] transition-colors px-2 py-1 -mx-2 rounded min-h-[44px] flex items-center"
                              >
                                Ver menos
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="hidden md:block">
              <section className="mt-6">
                <h3 className="text-lg font-medium mt-2 mb-3">
                  Considerações Gerais
                </h3>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li>
                    <strong>Código do Município:</strong> 2207207.
                  </li>
                  <li>
                    <strong>População estimada (2022):</strong> 6.382 pessoas.
                  </li>
                  <li>
                    <strong>Densidade demográfica (2022):</strong> 22,90
                    hab/km².
                  </li>
                  <li>
                    <strong>
                      Índice de Desenvolvimento Humano - IDH (2010):
                    </strong>{" "}
                    0,541
                  </li>
                  <li>
                    <strong>Área da Unidade Territorial (2024):</strong> 278,696
                    km² (Alto Médio Canindé).
                  </li>
                  <li>
                    <strong>Código de endereçamento postal:</strong> 64.680-000.
                  </li>
                  <li>
                    <strong>Aeroportos mais próximos:</strong> Aeroporto
                    Regional do Cariri - Juazeiro do Norte-CE (181,1 km) e
                    Aeroporto de Petrolina-PE (226,5 km).
                  </li>
                  <li>
                    <strong>Rios que banham o município:</strong> rio Curimatá e
                    Riacho do Padre.
                  </li>
                  <li>
                    <strong>Rodovias de acesso:</strong> PI-243 (liga à BR-407 e
                    BR-316) e PI-456 (estrada de piçarra que liga Alegrete-PI a
                    Simões).
                  </li>
                </ul>
              </section>
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setExpandedConsideracoes((prev) => !prev)}
                className="flex w-full items-center justify-between mt-6 mb-3 rounded-lg px-2 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a4ea1]/60 hover:bg-slate-100"
                aria-expanded={expandedConsideracoes}
              >
                <span className="text-left text-lg font-medium">
                  Considerações Gerais
                </span>
                {expandedConsideracoes ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedConsideracoes && (
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li>
                    <strong>Código do Município:</strong> 2207207.
                  </li>
                  <li>
                    <strong>População estimada (2022):</strong> 6.382 pessoas.
                  </li>
                  <li>
                    <strong>Densidade demográfica (2010):</strong> 24.47
                    hab./km².
                  </li>
                  <li>
                    <strong>
                      Índice de Desenvolvimento Humano - IDH (2010):
                    </strong>{" "}
                    0,541
                  </li>
                  <li>
                    <strong>Área da Unidade Territorial (2024):</strong> 278,637
                    km² (Alto Médio Canindé).
                  </li>
                  <li>
                    <strong>Código de endereçamento postal:</strong> 64.680-000.
                  </li>
                  <li>
                    <strong>Aeroportos mais próximos:</strong> Aeroporto
                    Regional do Cariri - Juazeiro do Norte-CE (181,1 km) e
                    Aeroporto de Petrolina-PE (226,5 km).
                  </li>
                  <li>
                    <strong>Rios que banham o município:</strong> rio Curimatá e
                    Riacho do Padre.
                  </li>
                  <li>
                    <strong>Rodovias de acesso:</strong> PI-243 (liga à BR-407 e
                    BR-316) e PI-456 (estrada de piçarra que liga Alegrete-PI a
                    Simões).
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Right: images + map */}
          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-4">
              <figure className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col items-center justify-center md:min-h-[200px] min-h-[150px]">
                <Image
                  src="/images/mapa-pm.png"
                  alt="Mapa Padre Marcos"
                  width={520}
                  height={320}
                  sizes="(max-width: 768px) 160px, 520px"
                  className="object-contain w-[160px] h-[200px] md:w-[520px] md:h-[320px]"
                  priority={false}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                />
                <figcaption className="text-xs text-gray-500 p-2 text-center">
                  Mapa de localização de Padre Marcos
                </figcaption>
              </figure>

              <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                <figure className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col items-center justify-center md:min-h-[200px] min-h-[150px]">
                  <Image
                    src="/images/bandeira-municipio.jpg"
                    alt="Bandeira"
                    width={450}
                    height={250}
                    sizes="(max-width: 768px) 180px, 520px"
                    className="object-contain w-[180px] h-[120px] md:w-[440px] md:h-[240px]"
                    priority={false}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                  />
                  <figcaption className="text-xs text-gray-500 p-2 text-center">
                    Bandeira do Município
                  </figcaption>
                </figure>
                <figure className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col items-center justify-center md:min-h-[200px] min-h-[150px]">
                  <Image
                    src="/images/brasao-municipal.jpg"
                    alt="Brasão"
                    width={200}
                    height={200}
                    sizes="(max-width: 768px) 160px, 400px"
                    className="object-contain w-[160px] h-[120px] md:w-[300px] md:h-[200px]"
                    priority={false}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                  />
                  <figcaption className="text-xs text-gray-500 p-2 text-center">
                    Brasão Municipal
                  </figcaption>
                </figure>
              </div>

              <figure className="mt-4 rounded-2xl border border-gray-200 p-3 bg-white shadow-sm">
                <div className="w-full h-52 overflow-hidden rounded">
                  <iframe
                    title="Localização de Padre Marcos"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3978.180963620112!2d-41.98624138468921!3d-7.1470840019735345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9487b6c9e0d2a8d3%3A0x123456789abcdef0!2sPadre%20Marcos%20-%20PI!5e0!3m2!1spt-BR!2sbr!4v1680000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                  />
                </div>
                <figcaption className="text-xs text-gray-500 p-2">
                  Localização aproximada (Google Maps)
                </figcaption>
              </figure>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
