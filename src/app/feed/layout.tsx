import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mural Digital de Padre Marcos | Portal PM",
  description:
    "Participe do mural colaborativo de Padre Marcos (PI). Compartilhe avisos, eventos, fotos e atualizações com a comunidade no Portal PM.",
  keywords: [
    "Padre Marcos",
    "mural digital",
    "rede comunitária",
    "feed de notícias",
    "Portal PM",
    "participação cidadã",
    "notícias de Padre Marcos",
    "últimas notícias Padre Marcos",
    "jornal Padre Marcos PI",
    "notícias locais Padre Marcos",
    "informações Padre Marcos",
  ],
};

export default function FeedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
