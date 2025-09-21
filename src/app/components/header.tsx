"use client";
/*
- Navegação principal (Header)
- Logo do portal
- Menu de navegação com links para as principais seções (Home, About, Feed, Contact)
*/

import Link from "next/link";
import Image from "next/image";
import { Open_Sans } from "next/font/google";
import { usePathname } from "next/navigation";

const openSans = Open_Sans({ subsets: ["latin"] });

export default function Header() {
  const pathname = usePathname();

  const linkBase =
    "hover:underline hover:underline-offset-8 hover:decoration-2 hover:text-[#fca311]";
  const activeClass =
    "underline underline-offset-8 decoration-2 text-[#fca311]";

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  return (
    <header className="flex justify-between h-25 items-center px-4 bg-[#e5e5e5]">
      <Image
        src="/images/logo-portal.png"
        alt="Portal PM"
        width="250"
        height="60"
        className="ml-3"
      />
      <nav className="mx-10">
        <ul
          className={`${openSans.className} flex gap-7 text-[#0077b6] text-xl font-extrabold`}
        >
          <li>
            <Link
              href="/"
              aria-current={isActive("/") ? "page" : undefined}
              className={`${linkBase} ${isActive("/") ? activeClass : ""}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              aria-current={isActive("/about") ? "page" : undefined}
              className={`${linkBase} ${isActive("/about") ? activeClass : ""}`}
            >
              Sobre
            </Link>
          </li>
          <li>
            <Link
              href="/feed"
              aria-current={isActive("/feed") ? "page" : undefined}
              className={`${linkBase} ${isActive("/feed") ? activeClass : ""}`}
            >
              Feed
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              aria-current={isActive("/contact") ? "page" : undefined}
              className={`${linkBase} ${
                isActive("/contact") ? activeClass : ""
              }`}
            >
              Contato
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
