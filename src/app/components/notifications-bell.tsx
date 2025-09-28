"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Loader2,
  Megaphone,
  RefreshCcw,
  AlertTriangle,
  Calendar,
  MapPin,
} from "lucide-react";
import { buildApiUrl } from "@/lib/api";

interface AlertPost {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  eventDate?: string | null;
  location?: string | null;
}

const formatRelativeTime = (iso: string) => {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "agora";

  const now = new Date();
  const seconds = Math.floor((now.getTime() - parsed.getTime()) / 1000);

  const units: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  let duration = seconds;
  let index = 0;

  while (index < units.length && Math.abs(duration) >= units[index][0]) {
    duration /= units[index][0];
    index += 1;
  }

  const unit = units[Math.min(index, units.length - 1)][1];
  return rtf.format(-Math.round(duration), unit);
};

const formatEventDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const trimContent = (content: string, limit = 140) => {
  if (content.length <= limit) return content;
  return `${content.slice(0, limit).trim()}…`;
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevOpenRef = useRef(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        buildApiUrl("/api/posts?alertOnly=true&limit=5")
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Não foi possível carregar os alertas."
        );
      }

      setAlerts(Array.isArray(data.posts) ? data.posts : []);
      setLastFetchedAt(Date.now());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao buscar alertas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (!open) return;

    const shouldRefresh = Date.now() - lastFetchedAt > 60_000;
    if (shouldRefresh && !loading) {
      fetchAlerts().catch(() => null);
    }
  }, [open, fetchAlerts, lastFetchedAt, loading]);

  useEffect(() => {
    if (prevOpenRef.current && !open) {
      setAlerts([]);
      setLastFetchedAt(0);
    }

    prevOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const badgeCount = alerts.length;

  const dropdownContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando alertas…
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center gap-3 py-6 text-center text-sm text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchAlerts}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Tentar novamente
          </button>
        </div>
      );
    }

    if (alerts.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 py-6 text-center text-sm text-slate-500">
          <Megaphone className="h-6 w-6 text-[#fca311]" />
          <span>Sem alertas importantes no momento.</span>
        </div>
      );
    }

    return (
      <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {alerts.map((alert) => {
          const eventDate = formatEventDate(alert.eventDate);
          return (
            <li key={alert.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#fca311]">
                    {alert.category || "Alerta"}
                  </p>
                  <p className="text-sm font-medium text-[#0b203a]">
                    {trimContent(alert.content)}
                  </p>
                  {(alert.location || eventDate) && (
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      {alert.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                          <MapPin className="h-3 w-3" /> {alert.location}
                        </span>
                      )}
                      {eventDate && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                          <Calendar className="h-3 w-3" /> {eventDate}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {formatRelativeTime(alert.createdAt)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }, [alerts, error, fetchAlerts, loading]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notificações"
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#0b203a] transition-colors hover:bg-[#0b203a]/5"
      >
        <Bell className="h-6 w-6 text-[#0a4ea1]" />
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#fca311] px-1 text-[10px] font-bold text-white">
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-3 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-[#0b203a]/20 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-[#0b203a]">
              Alertas recentes
            </p>
            <button
              type="button"
              onClick={fetchAlerts}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#0b203a]/70 hover:text-[#0b203a]"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Atualizar
            </button>
          </div>

          {dropdownContent}

          <div className="border-t border-slate-100 px-4 py-3 text-right">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0a4ea1] hover:text-[#08326b]"
              onClick={() => setOpen(false)}
            >
              Ver mural completo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
