"use client";

import { useState } from "react";
import Image from "next/image";
import { AtSign, Lock, User, LogIn, Mail } from "lucide-react";

export interface AuthUser {
  name: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  token?: string;
}

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  fullName: string;
  username: string;
};

type AuthResponse = {
  success: boolean;
  user?: AuthUser;
  message?: string;
};

// Simula uma função de login que seria chamada no backend
const handleLogin = async (
  credentials: LoginPayload
): Promise<AuthResponse> => {
  console.log("Tentativa de login com:", credentials);
  // Exemplo de chamada de API (substituir por fetch/axios real)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Retornar dados simulados
  return {
    success: true,
    user: {
      name: "Usuário Teste",
      email: credentials.email,
    },
  };
};

// Simula uma função de cadastro
const handleRegister = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  console.log("Tentativa de cadastro com:", payload);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    user: {
      name: payload.fullName,
      email: payload.email,
      username: payload.username,
    },
  };
};

interface LoginProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formEntries = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    ) as Record<string, string>;

    try {
      let response: AuthResponse;

      if (mode === "login") {
        const payload: LoginPayload = {
          email: formEntries.email ?? "",
          password: formEntries.password ?? "",
        };
        response = await handleLogin(payload);
      } else {
        const payload: RegisterPayload = {
          fullName: formEntries.fullName ?? "",
          username: formEntries.username ?? "",
          email: formEntries.email ?? "",
          password: formEntries.password ?? "",
        };
        response = await handleRegister(payload);
      }

      if (response.success && response.user) {
        onLoginSuccess(response.user);
      } else {
        setError(
          response.message ?? "Falha na autenticação. Verifique seus dados."
        );
      }
    } catch (err) {
      setError("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="flex flex-col items-center mb-6">
        <Image
          src="/images/logo-portal.png"
          alt="Logo Portal PM"
          width={150}
          height={150}
          className="mb-4"
        />
        <h1 className="text-2xl font-bold text-[#0b203a]">
          {mode === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
        </h1>
        <p className="text-sm text-slate-500">
          {mode === "login"
            ? "Acesse sua conta para continuar."
            : "Junte-se à comunidade de Padre Marcos."}
        </p>
      </div>

      {/* Botão Google */}
      <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">
        <Image src="/images/google.png" alt="Google logo" width={18} height={18} />
        Entrar com Google
      </button>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-slate-300"></div>
        <span className="mx-4 text-xs font-medium text-slate-400">OU</span>
        <div className="flex-grow border-t border-slate-300"></div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="fullName"
                placeholder="Nome e Sobrenome"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#fca311] focus:border-[#fca311] transition"
                required
              />
            </div>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="username"
                placeholder="Nome de usuário"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#fca311] focus:border-[#fca311] transition"
                required
              />
            </div>
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#fca311] focus:border-[#fca311] transition"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#fca311] focus:border-[#fca311] transition"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b203a] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#13335c] transition-all disabled:opacity-50"
        >
          <LogIn className="h-5 w-5" />
          {isLoading
            ? "Processando..."
            : mode === "login"
            ? "Entrar"
            : "Cadastrar"}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-slate-600">
          {mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-[#fca311] hover:underline ml-1"
          >
            {mode === "login" ? "Cadastre-se" : "Faça login"}
          </button>
        </p>
      </div>
    </div>
  );
}
