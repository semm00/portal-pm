// Tela para fazer login e depois ver e editar o perfil do usuário
"use client";

import { useState } from "react";
import Login from "./components/login";
import Profile from "./components/profile";
import type { AuthUser } from "./components/login";

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Se o usuário não estiver logado, mostra a tela de login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Login onLoginSuccess={setUser} />
      </div>
    );
  }

  // Se o usuário estiver logado, mostra a tela de perfil
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Profile user={user} onLogout={() => setUser(null)} />
    </div>
  );
}
