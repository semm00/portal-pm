"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Lightbulb,
  Megaphone,
  Calendar,
  BarChart3,
  MapPin,
  Tag,
} from "lucide-react";

export type FilterType = "todos" | "avisos" | "enquetes" | "eventos" | "locais";

const filters: Array<{
  label: string;
  value: FilterType;
  description: string;
  icon:
    | typeof Megaphone
    | typeof BarChart3
    | typeof Calendar
    | typeof MapPin
    | typeof Tag;
}> = [
  {
    label: "Todos",
    value: "todos",
    description: "Veja cada atualização do mural",
    icon: Tag,
  },
  {
    label: "Avisos",
    value: "avisos",
    description: "Comunicados importantes da comunidade",
    icon: Megaphone,
  },
  {
    label: "Enquetes",
    value: "enquetes",
    description: "Participe e compartilhe sua opinião",
    icon: BarChart3,
  },
  {
    label: "Eventos",
    value: "eventos",
    description: "Acompanhe a agenda da cidade",
    icon: Calendar,
  },
  {
    label: "Locais",
    value: "locais",
    description: "Descubra espaços e pontos de interesse",
    icon: MapPin,
  },
];

interface FeedHeaderProps {
  onSearch?: (query: string) => void;
  onFilter?: (filter: FilterType) => void;
  searchQuery?: string;
  activeFilter?: FilterType;
}

export default function FeedHeader({
  onSearch,
  onFilter,
  searchQuery = "",
  activeFilter = "todos",
}: FeedHeaderProps) {
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [currentFilter, setCurrentFilter] = useState<FilterType>(activeFilter);
  const [showTipsMobile, setShowTipsMobile] = useState(false);

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentFilter(activeFilter);
  }, [activeFilter]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleFilterClick = (filter: FilterType) => {
    setCurrentFilter(filter);
    onFilter?.(filter);
  };

  const activeFilterDetails = useMemo(
    () => filters.find((item) => item.value === currentFilter),
    [currentFilter]
  );
  const ActiveFilterIcon = activeFilterDetails?.icon;

  return (
    <header className="w-full rounded-3xl border border-[#0b203a]/15 bg-gradient-to-r from-white via-[#f8fbff] to-white shadow-xl shadow-[#0b203a]/15 backdrop-blur-sm">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <div className="w-full md:flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#193a62] block mb-2">
              Buscar no mural
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#0b203a]" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Digite palavras-chave, datas ou categorias"
                className="w-full rounded-2xl border border-[#0b203a]/25 bg-white/90 pl-11 pr-4 py-3 text-sm text-[#0b203a] placeholder:text-[#0b203a]/40 focus:border-[#0b203a] focus:outline-none focus:ring-2 focus:ring-[#fca311]/30 transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0b203a] mb-2">
              <Filter className="h-4 w-4 text-[#fca311]" />
              <span className="bg-[#fca311]/10 text-[#0b203a] px-2 py-0.5 rounded-full">
                Filtrar conteúdo
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:max-w-none md:flex-wrap">
              {filters.map(({ label, value, icon: Icon }) => {
                const isActive = currentFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleFilterClick(value)}
                    aria-pressed={isActive}
                    className={`group flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                      isActive
                        ? "border-[#0b203a] bg-gradient-to-r from-[#0b203a] to-[#13335c] text-white shadow-md"
                        : "border-[#0b203a]/20 bg-white/95 text-[#0b203a] hover:border-[#fca311] hover:bg-[#fca311]/15"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isActive ? "scale-105" : "group-hover:scale-105"
                      }`}
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {activeFilterDetails && ActiveFilterIcon && (
          <div className="flex flex-col gap-2 rounded-2xl border border-[#0b203a]/10 bg-white/80 p-4 text-sm text-[#0b203a]/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-[#0b203a]">
              <ActiveFilterIcon className="h-6 w-6" />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#0b203a]/70">
                  Filtro ativo
                </span>
                <span className="text-base font-semibold text-[#0b203a]">
                  {activeFilterDetails.label}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#0b203a]/70 sm:max-w-md">
              {activeFilterDetails.description}
            </p>
          </div>
        )}

        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setShowTipsMobile((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-[#0b203a]/20 bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#0b203a] shadow-sm transition-colors hover:border-[#0b203a] hover:bg-[#0b203a]/10"
          >
            <Lightbulb className="h-4 w-4 text-[#fca311]" />
            {showTipsMobile ? "Ocultar dicas" : "Mostrar dicas"}
          </button>
        </div>

        <div
          className={`${
            showTipsMobile ? "grid" : "hidden"
          } gap-3 text-xs text-[#0b203a]/65 md:grid md:grid-cols-3`}
        >
          <div className="rounded-2xl border border-[#0b203a]/15 bg-white/80 px-4 py-3 shadow-sm shadow-[#0b203a]/10">
            <span className="font-semibold text-[#0b203a] block">Dica</span>
            Use a busca para encontrar rapidamente avisos ou eventos
            específicos.
          </div>
          <div className="rounded-2xl border border-[#0b203a]/15 bg-white/80 px-4 py-3 shadow-sm shadow-[#0b203a]/10">
            <span className="font-semibold text-[#0b203a] block">Filtros</span>
            Combine filtros para ver apenas o que importa no momento.
          </div>
          <div className="rounded-2xl border border-[#0b203a]/15 bg-white/80 px-4 py-3 shadow-sm shadow-[#0b203a]/10">
            <span className="font-semibold text-[#0b203a] block">Engaje</span>
            Compartilhe novidades, fotos e eventos da cidade com a comunidade.
          </div>
        </div>
      </div>
    </header>
  );
}
