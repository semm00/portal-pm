import { buildApiUrl } from "@/lib/api";
import type { AuthUser } from "../types";

const STORAGE_KEY = "portalpm.session";
export const DEFAULT_SESSION_DURATION_MS = 4 * 24 * 60 * 60 * 1000; // 4 dias

const isBrowser = () => typeof window !== "undefined";

export const saveSession = (
  user: AuthUser,
  durationMs: number = DEFAULT_SESSION_DURATION_MS
): AuthUser => {
  const payload: AuthUser = {
    ...user,
    expiresAt: Date.now() + durationMs,
  };

  if (!isBrowser()) {
    return payload;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Não foi possível salvar a sessão:", error);
  }

  return payload;
};

export const loadSession = (): AuthUser | null => {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AuthUser;

    if (!parsed.token) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Não foi possível carregar a sessão:", error);
    return null;
  }
};

export const clearSession = () => {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Não foi possível limpar a sessão:", error);
  }
};

type RefreshResponse = {
  success?: boolean;
  token?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  expiresIn?: number;
};

const resolveTokenExpiry = (payload: RefreshResponse): number | undefined => {
  if (payload.tokenExpiresAt) {
    return payload.tokenExpiresAt;
  }

  if (typeof payload.expiresIn === "number") {
    return Date.now() + payload.expiresIn * 1000;
  }

  return undefined;
};

export const refreshSession = async (): Promise<AuthUser | null> => {
  if (!isBrowser()) return null;

  const current = loadSession();
  if (!current?.refreshToken) {
    return null;
  }

  try {
    const response = await fetch(buildApiUrl("/api/users/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RefreshResponse;

    if (!data?.success || !data.token) {
      return null;
    }

    const next: AuthUser = {
      ...current,
      token: data.token ?? current.token,
      refreshToken: data.refreshToken ?? current.refreshToken,
      tokenExpiresAt: resolveTokenExpiry(data) ?? current.tokenExpiresAt,
    };

    return saveSession(next, DEFAULT_SESSION_DURATION_MS);
  } catch (error) {
    console.error("Não foi possível renovar a sessão:", error);
    return null;
  }
};
