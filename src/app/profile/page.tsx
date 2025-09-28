// Tela para fazer login e depois ver e editar o perfil do usuário
"use client";

import { useEffect, useState } from "react";
import type { Metadata } from "next";
import Login from "./components/login";
import Profile from "./components/profile";
import type { AuthUser } from "./types";
import {
  clearSession,
  loadSession,
  saveSession,
  DEFAULT_SESSION_DURATION_MS,
} from "./utils/session";

export const metadata: Metadata = {
  title: "Área do Cidadão | Portal PM",
  description:
    "Acesse a área de login do Portal PM para atualizar dados pessoais, acompanhar solicitações e gerenciar a conta de cidadão de Padre Marcos.",
  keywords: [
    "Portal PM",
    "login cidadão",
    "perfil do usuário",
    "Padre Marcos",
    "serviços online",
  ],
};

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (loggedUser: AuthUser) => {
    const persisted = saveSession(loggedUser, DEFAULT_SESSION_DURATION_MS);
    setUser(persisted);
  };

  const handleUserUpdate = (updater: (currentUser: AuthUser) => AuthUser) => {
    setUser((currentUser) => {
      if (!currentUser) return null;
      const updated = updater(currentUser);
      saveSession(updated, DEFAULT_SESSION_DURATION_MS);
      return updated;
    });
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-500">Carregando sessão...</div>
      </div>
    );
  }

  // Se o usuário não estiver logado, mostra a tela de login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Se o usuário estiver logado, mostra a tela de perfil
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Profile
        user={user}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
}
