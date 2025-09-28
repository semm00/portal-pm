import "./globals.css";
import Sidebar from "./components/menu";
import ContentWrapper from "./components/content-wrapper";
import type { Metadata } from "next";
//import Header from './components/header';

export const metadata: Metadata = {
  title: "Portal PM | Portal Oficial de Padre Marcos",
  description:
    "Portal oficial do município de Padre Marcos (PI). Notícias, eventos, serviços públicos, turismo e informações sobre a cidade.",
  keywords: [
    "cidade Padre Marcos PI",
    "notícias de Padre Marcos",
    "eventos em Padre Marcos",
    "previsão do tempo Padre Marcos",
    "portal Padre Marcos",
    "Sobre (Município, História, Localização)",
    "história de Padre Marcos PI",
    "onde fica Padre Marcos",
    "informações sobre Padre Marcos",
    "mapa de Padre Marcos",
    "curiosidades de Padre Marcos",
    "Notícias",
    "últimas notícias Padre Marcos",
    "jornal Padre Marcos PI",
    "notícias locais Padre Marcos",
    "informações Padre Marcos",
    "Turismo",
    "pontos turísticos Padre Marcos",
    "o que fazer em Padre Marcos",
    "turismo em Padre Marcos PI",
    "fotos de Padre Marcos",
    "lugares para visitar Padre Marcos",
    "Negócios",
    "comércios em Padre Marcos",
    "empresas locais Padre Marcos PI",
    "onde comprar em Padre Marcos",
    "negócios em Padre Marcos",
    "serviços em Padre Marcos",
    "Eventos",
    "agenda de eventos Padre Marcos",
    "festas em Padre Marcos PI",
    "programação cultural Padre Marcos",
    "shows em Padre Marcos",
    "calendário de eventos Padre Marcos",
    "Contato",
    "contato Padre Marcos PI",
    "sugestões Padre Marcos",
    "fale conosco Padre Marcos",
    "newsletter Padre Marcos",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className="md:flex md:min-h-screen bg-slate-50 text-[#0b203a] transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100">
        {/* Sidebar fixa no desktop; no mobile permanece fixa inferior via componente */}
        <Sidebar />
        {/* Conteúdo principal com margem dinâmica conforme largura da sidebar */}
        <ContentWrapper>{children}</ContentWrapper>
      </body>
    </html>
  );
}
