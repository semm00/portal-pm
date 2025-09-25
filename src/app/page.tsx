/*
Home Page "Portal PM"
Esta é a página inicial do Portal PM

estrutura da página:
- Logo do portal no topo                                 - icone notificações (campainha)
- Seção com slideshow ou imagem destacada da cidade e texto de boas-vindas
- Seção com últimas notícias
- Eventos próximos → lista curta (2 ou 3 próximos).
- contato rápido (telefone, email, redes sociais) 
- Responsividade para dispositivos móveis
*/

import Slides from "./components/slides";
import News from "./components/news";
import Image from "next/image";
import { Bell } from "lucide-react";

export default function Home() {
  return (
    <main>
      {/* Top bar: logo à esquerda e notificações à direita */}
      <div className="px-3 sm:px-4 md:px-6">
        <div className="mx-auto py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-portal.png"
              alt="Portal PM"
              width={250}
              height={60}
              className="h-13 w-auto"
              priority
            />
          </div>
          {/* Botão de notificações */}
          <button
            type="button"
            aria-label="Notificações"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors text-[#0b203a] hover:text-[#0b203a] border-gray-200 dark:border-[#0a4ea1] dark:text-neutral-200"
          >
            <Bell className="h-6 w-6 text-[#0a4ea1]" />
            {/* badge opcional */}
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#fca311] px-1 text-[10px] font-bold text-white">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Hero/Slideshow */}
      <div className="px-5 sm:px-8 md:px-10">
        <div className="mx-auto">
          <Slides />
        </div>
      </div>

      {/* Últimas notícias */}
      <div className="px-5 sm:px-8 md:px-10 my-5">
        <div className="mx-auto">
          {/* Server component pronto para back-end */}
          <News />
        </div>
      </div>
    </main>
  );
}
