import "./globals.css";
import Sidebar from "./components/menu";
import ContentWrapper from "./components/content-wrapper";
//import Header from './components/header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="md:flex md:min-h-screen">
        {/* Sidebar fixa no desktop; no mobile permanece fixa inferior via componente */}
        <Sidebar />
        {/* Conteúdo principal com margem dinâmica conforme largura da sidebar */}
        <ContentWrapper>{children}</ContentWrapper>
      </body>
    </html>
  );
}
