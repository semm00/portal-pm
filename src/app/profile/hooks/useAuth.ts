"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadSession,
  saveSession,
  refreshSession,
  clearSession,
  DEFAULT_SESSION_DURATION_MS,
} from "../utils/session";
import type { AuthUser } from "../types";

const TOKEN_REFRESH_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutos antes da expiração

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = useCallback((updater: (user: AuthUser) => AuthUser) => {
    setUser((currentUser) => {
      if (!currentUser) return null;
      const updatedUser = updater(currentUser);
      saveSession(updatedUser);
      return updatedUser;
    });
  }, []);

  const login = useCallback((newUser: AuthUser) => {
    const savedUser = saveSession(newUser);
    setUser(savedUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Função para verificar e renovar token se necessário
  const checkAndRefreshToken = useCallback(async () => {
    const session = loadSession();
    if (!session) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    const tokenExpiry = session.tokenExpiresAt ?? session.expiresAt ?? 0;
    const timeUntilTokenExpiry = tokenExpiry ? tokenExpiry - now : Infinity;

    // Token expirado ou prestes a expirar -> tenta renovar
    if (timeUntilTokenExpiry <= TOKEN_REFRESH_THRESHOLD_MS) {
      try {
        const refreshedUser = await refreshSession();
        if (refreshedUser) {
          setUser(refreshedUser);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Erro ao renovar token:", error);
      }

      clearSession();
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Token ainda é válido
    // Garante que a sessão seja revalidada por mais 4 dias
    if (
      !session.expiresAt ||
      session.expiresAt - now < DEFAULT_SESSION_DURATION_MS / 2
    ) {
      saveSession(session);
    }

    setUser(session);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAndRefreshToken();

    // Configura um intervalo para verificar o token periodicamente
    const interval = setInterval(checkAndRefreshToken, 5 * 60 * 1000); // A cada 5 minutos

    return () => clearInterval(interval);
  }, [checkAndRefreshToken]);

  return {
    user,
    isLoading,
    login,
    logout,
    updateUser,
  };
};
