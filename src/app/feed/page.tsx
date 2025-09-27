"use client";

/*
Feed Page "Portal PM"
Esta é a página de feed do Portal PM, onde você encontrará as últimas atualizações, galeria com fotos, notícias e eventos relacionados à cidade de Padre Marcos.

estrutura da página:
- Filtros para categorizar o conteúdos: todas, eventos, avisos, enquetes, locais
- Seção com galeria de fotos
- Formulário para envio de fotos, vídeos e atualizações pelos usuários
- Responsividade para dispositivos móveis
explicação: essa página serve como um hub central para todas as atualizações e conteúdos gerados pelos moradores, promovendo o engajamento dos cidadãos com a cidade. 
é como se fosse um mural digital.
*/

import { useState } from "react";
import { PlusCircle, XCircle } from "lucide-react";
import FeedForm from "./components/form";
import FeedHeader, { type FilterType } from "./components/header";
import Posts from "./components/posts";

export default function Feed() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("todos");

  const handlePostSubmitted = () => {
    setIsFormOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  return (
    <div className="mx-auto w-full max-w-6xl xl:max-w-7xl px-4 py-10 lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 text-center lg:text-left lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <div>
              <h1 className="text-2xl font-bold text-[#153b69] leading-tight">
                Mural Digital
              </h1>
              <p className="text-sm text-[#0b203a]/70">
                Compartilhe atualizações, eventos e avisos com a comunidade de
                Padre Marcos.
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#fca311]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#fca311]" />
            Espaço colaborativo em tempo real
          </div>
        </div>

        <FeedHeader
          onSearch={handleSearchChange}
          onFilter={handleFilterChange}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />

        <div className="rounded-3xl border border-[#0b203a]/15 bg-gradient-to-br from-white via-white to-slate-50/60 shadow-lg shadow-[#0b203a]/10 backdrop-blur-sm px-5 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#0b203a]">
                Compartilhe uma nova atualização
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                isFormOpen
                  ? "bg-[#0b203a] text-white shadow-md hover:bg-[#13335c]"
                  : "bg-[#0b203a] text-white shadow-md hover:bg-[#13335c]"
              }`}
            >
              {isFormOpen ? (
                <>
                  <XCircle className="h-5 w-5" />
                  Fechar
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5" />
                  Postar nova atualização
                </>
              )}
            </button>
          </div>

          {isFormOpen && (
            <div className="mt-6">
              <FeedForm onSubmitted={handlePostSubmitted} />
            </div>
          )}
        </div>

        {/* Seção de Posts */}
        <Posts
          refreshKey={refreshKey}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      </div>
    </div>
  );
}
