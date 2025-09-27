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
