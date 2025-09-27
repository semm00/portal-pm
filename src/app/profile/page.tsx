// Tela para fazer login e depois ver e editar o perfil do usuário
"use client";

import { useEffect, useState } from "react";
import Login from "./components/login";
import Profile from "./components/profile";
import type { AuthUser } from "./types";
import { clearSession, loadSession, saveSession } from "./utils/session";

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = loadSession();
    if (stored) {
      setUser(stored);
    }
  }, []);

  const handleLoginSuccess = (loggedUser: AuthUser) => {
    const persisted = saveSession(loggedUser, SESSION_DURATION_MS);
    setUser(persisted);
  };

  const handleUserUpdate = (updatedUser: AuthUser) => {
    const persisted = saveSession(updatedUser, SESSION_DURATION_MS);
    setUser(persisted);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

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
