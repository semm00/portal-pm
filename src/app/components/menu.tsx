"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home as HomeIcon,
  Newspaper,
  Instagram,
  Calendar as CalendarIcon,
  User as UserIcon,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Theme = "light" | "dark";

function useTheme(): [Theme, () => void, boolean] {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      const initial: Theme = stored === "dark" ? "dark" : "light";
      setTheme(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
    } catch {
      // noop
    }
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // noop
    }
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return [theme, toggle, mounted];
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function themeClass<T extends string>(
  theme: "light" | "dark",
  mounted: boolean,
  lightClass: T,
  darkClass: T
): T {
  // Antes de montar, force light para evitar flicker/mismatch
  if (!mounted) return lightClass;
  return theme === "dark" ? darkClass : lightClass;
}

type LinkItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const links: LinkItem[] = [
  { href: "/profile", label: "Perfil", Icon: UserIcon },
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/about", label: "Sobre", Icon: Newspaper },
  { href: "/feed", label: "Feed", Icon: Instagram },
  { href: "/events", label: "Eventos", Icon: CalendarIcon },
];

function isActivePath(current: string | null, href: string) {
  if (!current) return false;
  if (href === "/") return current === "/";
  return current.startsWith(href);
}

export default function Menu() {
  const pathname = usePathname();
  const [theme, toggleTheme, mounted] = useTheme();
  // Sidebar expand/collapse (SSR-safe: inicia fechado; persiste após montar)
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("menu:expanded");
      if (saved === "true") setExpanded(true);
    } catch {
      /* noop */
    }
  }, []);
  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("menu:expanded", String(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  // Notifica mudança de expansão somente após o commit
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("menu:expanded", { detail: { expanded } })
      );
    } catch {
      /* noop */
    }
  }, [expanded]);

  // Sidebar (desktop) — compacta/expansível
  const Sidebar = (
    <aside
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:border-r py-4", // fixa na lateral
        expanded ? "md:w-72" : "md:w-20 items-center",
        themeClass(theme, mounted, "bg-white", "bg-neutral-900"),
        themeClass(
          theme,
          mounted,
          "md:border-gray-200",
          "md:border-neutral-800"
        )
      )}
      aria-label="Menu lateral"
    >
      {/* Botão de expandir/retrair */}
      <div
        className={cn(
          "px-2 mb-4 flex",
          expanded ? "justify-end" : "justify-center"
        )}
      >
        <button
          type="button"
          onClick={toggleExpanded}
          aria-label={expanded ? "Recolher menu" : "Expandir menu"}
          aria-expanded={expanded}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg",
            themeClass(
              theme,
              mounted,
              "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
              "border border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
            )
          )}
        >
          {expanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1">
        <ul
          className={cn(
            "flex flex-col gap-3",
            expanded ? "px-2" : "items-center"
          )}
        >
          {links.map(({ href, label, Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  title={expanded ? undefined : label}
                  className={cn(
                    "group relative flex items-center rounded-xl",
                    themeClass(
                      theme,
                      mounted,
                      "text-sky-700 hover:bg-sky-50 hover:text-sky-800",
                      "text-neutral-200 hover:bg-neutral-800 hover:text-white"
                    ),
                    active &&
                      themeClass(
                        theme,
                        mounted,
                        "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                        "bg-amber-950/20 text-amber-300 ring-1 ring-amber-700/40"
                      ),
                    expanded ? "gap-3 px-3 py-2" : "h-10 w-10 justify-center"
                  )}
                >
                  {/* Indicador de ativo */}
                  <span
                    className={cn(
                      "absolute left-0 h-5 w-1 rounded-r bg-amber-500 opacity-0 group-hover:opacity-100",
                      active && "opacity-100",
                      expanded && "left-0"
                    )}
                    aria-hidden="true"
                  />
                  <Icon className={cn("h-6 w-6", active && "text-[#fca311]")} />
                  {expanded ? (
                    <span className="text-sm font-medium truncate">
                      {label}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs opacity-0 shadow-sm transition-opacity group-hover:opacity-100",
                        themeClass(
                          theme,
                          mounted,
                          "border border-gray-200 bg-white text-slate-900",
                          "border border-neutral-700 bg-neutral-800 text-white"
                        )
                      )}
                    >
                      {label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={cn("mt-auto", expanded ? "px-2 w-full" : undefined)}>
        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            "flex items-center justify-center rounded-xl shadow-sm",
            expanded ? "h-9 w-full gap-2 px-3" : "h-10 w-10",
            themeClass(
              theme,
              mounted,
              "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
              "border border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
            )
          )}
          aria-label="Alternar tema claro/escuro"
        >
          {mounted && theme === "dark" ? (
            <>
              <Sun className="h-5 w-5 text-yellow-500" />
              {expanded && (
                <span className="text-sm font-medium">Modo claro</span>
              )}
            </>
          ) : (
            <>
              <Moon className="h-5 w-5 text-sky-700" />
              {expanded && (
                <span className="text-sm font-medium">Modo escuro</span>
              )}
            </>
          )}
        </button>
      </div>
    </aside>
  );

  // Bottom nav (mobile)
  const BottomNav = (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t",
        themeClass(
          theme,
          mounted,
          "bg-white/95 border-gray-200",
          "bg-neutral-900/90 border-neutral-800"
        )
      )}
      aria-label="Menu inferior"
    >
      <ul className="flex items-stretch justify-around">
        {[
          links[1], // Home
          links[2], // Sobre
          links[3], // Feed
          links[4], // Eventos
          links[0], // Perfil
        ].map(({ href, label, Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium",
                  "text-[#0b203a] hover:text-[#0a4ea1] dark:text-neutral-200 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-[#fca311]")} />
                <span className={cn(active && "text-[#fca311]")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {Sidebar}
      {BottomNav}
    </>
  );
}
