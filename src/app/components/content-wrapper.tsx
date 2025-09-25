"use client";

import { useEffect, useState } from "react";

export default function ContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // carga inicial do estado salvo
    try {
      const saved = localStorage.getItem("menu:expanded");
      if (saved === "true") setExpanded(true);
    } catch {
      // noop
    }

    // ouve alterações disparadas pelo menu
    const onExpanded = (e: Event) => {
      const detail = (e as CustomEvent<{ expanded: boolean }>).detail;
      if (detail && typeof detail.expanded === "boolean") {
        setExpanded(detail.expanded);
      }
    };
    window.addEventListener("menu:expanded", onExpanded as EventListener);

    // também reage a mudanças no localStorage (outros tabs)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "menu:expanded" && e.newValue != null) {
        setExpanded(e.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("menu:expanded", onExpanded as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <div
      className={`flex-1 pb-16 md:pb-0 transition-[margin] duration-300 ${
        expanded ? "md:ml-72" : "md:ml-20"
      }`}
    >
      {children}
    </div>
  );
}
