/*
About Page "Portal PM"
Esta é a página sobre a cidade de Padre Marcos, onde você encontrará informações sobre a cidade, sua história e muito mais.

estrutura da página:
- Seção com informações gerais do município (dados demográficos e geográficos) + imagens
- Seção com linha temporal de prefeitos da cidade como se fosse um infográfico
- Seção com referências bibliográficas
- Responsividade para dispositivos móveis
*/

import type { Metadata } from "next";
import Info from "./components/info";
import MayorLine from "./components/mayor-line";
import References from "./components/references";

export const metadata: Metadata = {
  title: "Sobre Padre Marcos | Portal PM",
  description:
    "Conheça a história, geografia, gestores e curiosidades do município de Padre Marcos, Piauí, no Portal PM.",
  keywords: [
    "Padre Marcos",
    "história de Padre Marcos",
    "cultura",
    "prefeitos de Padre Marcos",
    "dados do município",
    "Portal PM",
    "história de Padre Marcos PI",
    "onde fica Padre Marcos",
    "informações sobre Padre Marcos",
    "mapa de Padre Marcos",
    "curiosidades de Padre Marcos",
  ],
};

export default function About() {
  return (
    <main className="bg-slate-50 transition-colors duration-300 dark:bg-neutral-950">
      <Info />
      <MayorLine />
      <References />
    </main>
  );
}
