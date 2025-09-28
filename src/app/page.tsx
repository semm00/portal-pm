/*
Home Page "Portal PM"
Esta é a página inicial do Portal PM

estrutura da página:
- Logo do portal no topo                                 - icone notificações (campainha)
- Seção com slideshow ou imagem destacada da cidade e texto de boas-vindas
- Seção com últimas notícias
- Eventos próximos → lista curta (3 ou 4 próximos).
- contato rápido (telefone, email, redes sociais) 
- Responsividade para dispositivos móveis
*/

import type { Metadata } from "next";
import Image from "next/image";
import Slides from "./components/slides";
import News from "./components/news";
import Events from "./components/events";
import Footer from "./components/footer";
import NotificationsBell from "./components/notifications-bell";

export const metadata: Metadata = {
  title: "Portal PM | Notícias e serviços de Padre Marcos",
  description:
    "Portal oficial de Padre Marcos (PI) com notícias, eventos, serviços públicos e informações úteis para moradores e visitantes.",
  keywords: [
    "Portal PM",
    "Padre Marcos",
    "notícias",
    "eventos",
    "serviços públicos",
    "Prefeitura de Padre Marcos",
    "Tudo sobre PM",
    "Padre Marcos Piauí",
    "padre marcos",
    "portal pm",
    "cidade Padre Marcos PI",
    "notícias de Padre Marcos",
    "eventos em Padre Marcos",
    "previsão do tempo Padre Marcos",
    "portal Padre Marcos",
    "informações Padre Marcos",
    "últimas notícias Padre Marcos",
    "notícias locais Padre Marcos",
    "agenda de eventos Padre Marcos",
    "calendário de eventos Padre Marcos",
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-[#0b203a] transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Top bar: logo à esquerda e notificações à direita */}
      <div className="px-3 sm:px-4 md:px-6">
        <div className="mx-auto py-5 flex items-center justify-between rounded-2xl border border-transparent bg-white shadow-sm transition-colors duration-300 dark:border-neutral-800 dark:bg-neutral-900/80 dark:shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
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
          <NotificationsBell />
        </div>
      </div>

      {/* Hero/Slideshow */}
      <div className="px-5 sm:px-8 md:px-10">
        <div className="mx-auto">
          <Slides />
        </div>
      </div>

      {/* Últimas notícias */}
      <div className="my-10">
        <div className="mx-auto space-y-8">
          {/* Server component pronto para back-end */}
          <News />
          {/* Próximos eventos */}
          <Events />
          {/* Contato rápido */}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
