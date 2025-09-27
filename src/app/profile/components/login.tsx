"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Script from "next/script";
import { AtSign, Lock, User, LogIn, Mail } from "lucide-react";
import type { AuthUser } from "../types";

// Declarar tipos para Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: { theme: string; size: string; width: string }
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
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
  code?: string; // Adicionado para códigos de erro específicos
  emailSent?: boolean;
  token?: string;
  refreshToken?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

const handleLogin = async (
  credentials: LoginPayload
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = (await response.json()) as AuthResponse;

  if (!response.ok) {
    return {
      success: false,
      message: data.message ?? "Falha no login.",
      code: data.code, // Passa o código de erro para o frontend
    };
  }

  return data;
};

const handleRegister = async (
  payload: RegisterPayload
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AuthResponse;

  if (!response.ok) {
    return {
      success: false,
      message: data.message ?? "Falha no cadastro.",
    };
  }

  return data;
};

const resendVerificationEmail = async (
  email: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/users/send-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = (await response.json()) as AuthResponse;

  if (!response.ok) {
    return {
      success: false,
      message: data.message ?? "Falha ao reenviar e-mail.",
    };
  }

  return data;
};

interface LoginProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");
  const [googleLoading, setGoogleLoading] = useState(true);
  const [isGsiLoaded, setGsiLoaded] = useState(false);

  const handleGsiLoad = () => {
    setGsiLoaded(true);
    console.log("Script GSI carregado e pronto.");
  };

  const handleResendVerification = async () => {
    if (!emailForResend) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await resendVerificationEmail(emailForResend);
      if (response.success) {
        setSuccessMessage(response.message ?? "E-mail reenviado com sucesso!");
        setShowResend(false);
        setError(null);
      } else {
        setError(response.message ?? "Falha ao reenviar e-mail.");
      }
    } catch {
      setError("Ocorreu um erro ao reenviar o e-mail.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setShowResend(false);

    const formEntries = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    ) as Record<string, string>;

    const email = formEntries.email ?? "";

    try {
      let response: AuthResponse;

      if (mode === "login") {
        const payload: LoginPayload = {
          email,
          password: formEntries.password ?? "",
        };
        response = await handleLogin(payload);

        if (response.success && response.user) {
          const userWithTokens: AuthUser = {
            ...response.user,
            token: response.token ?? response.user.token,
            refreshToken: response.refreshToken,
          };
          onLoginSuccess(userWithTokens);
        } else if (response.code === "EMAIL_NOT_VERIFIED") {
          setError(response.message ?? "E-mail não verificado.");
          setShowResend(true);
          setEmailForResend(email);
        } else {
          setError(
            response.message ?? "Falha na autenticação. Verifique seus dados."
          );
        }
      } else {
        const payload: RegisterPayload = {
          fullName: formEntries.fullName ?? "",
          username: formEntries.username ?? "",
          email,
          password: formEntries.password ?? "",
        };
        response = await handleRegister(payload);

        if (response.success) {
          setSuccessMessage(
            response.message ??
              "Cadastro realizado! Verifique seu e-mail para ativar a conta."
          );
          setMode("login"); // Mudar para a tela de login
          if (response.emailSent === false) {
            setShowResend(true);
            setEmailForResend(email);
          }
        } else {
          setError(response.message ?? "Falha no cadastro.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar Google Identity Services (GSI) e integrar fluxo (id_token -> backend)
  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID não definido");
      setGoogleLoading(false);
      return;
    }

    if (!isGsiLoaded) {
      console.log("Aguardando carregamento do script GSI...");
      setGoogleLoading(true);
      return;
    }

    let cancelled = false;

    const handleCredentialResponse = async (response: {
      credential: string;
    }) => {
      console.log(
        "Recebido idToken do Google:",
        response.credential.substring(0, 50) + "..."
      );
      const credential = response?.credential;
      if (!credential) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/login/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: credential }),
        });
        const data = await res.json();
        console.log("Resposta do backend:", data);
        if (res.ok && data.user) {
          const userWithTokens: AuthUser = {
            ...data.user,
            token: data.token ?? data.user.token,
            refreshToken: data.refreshToken,
          };
          onLoginSuccess(userWithTokens);
        } else {
          setError(data.message ?? "Falha no login com Google.");
        }
      } catch (err) {
        console.error("Erro no login Google:", err);
        setError("Erro ao autenticar com Google. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    const initializeGsi = () => {
      if (cancelled || !window.google?.accounts?.id) {
        setGoogleLoading(false);
        return;
      }

      try {
        console.log("Inicializando GSI com client_id:", googleClientId);
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        const element = document.getElementById("gsi-button");
        if (element) {
          // Limpa o botão antigo para evitar duplicatas em re-renderizações
          element.innerHTML = "";
          window.google.accounts.id.renderButton(element, {
            theme: "outline",
            size: "large",
            width: "320",
          });
          const googleButton = element.firstElementChild as HTMLElement | null;
          if (googleButton) {
            googleButton.style.width = "100%";
          }
          console.log("Botão do Google renderizado.");
        } else {
          console.error("Elemento #gsi-button não encontrado");
        }
      } catch (err) {
        console.error("Erro ao inicializar GSI:", err);
      } finally {
        setGoogleLoading(false);
      }
    };

    initializeGsi();

    return () => {
      cancelled = true;
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.cancel();
        }
      } catch (err) {
        console.error("Erro ao cancelar GSI:", err);
      }
    };
  }, [isGsiLoaded, onLoginSuccess]);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={handleGsiLoad}
        onError={() => {
          console.error("Falha ao carregar script GSI");
          setGoogleLoading(false);
          setGsiLoaded(false);
        }}
      />
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

      {successMessage && (
        <div
          className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50"
          role="alert"
        >
          {successMessage}
        </div>
      )}
      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
          role="alert"
        >
          {error}
          {showResend && (
            <button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="font-semibold underline ml-2 hover:text-red-900 disabled:opacity-50"
            >
              {isLoading ? "Reenviando..." : "Reenviar e-mail"}
            </button>
          )}
        </div>
      )}

      {/* Botão Google */}
      <div className="relative w-full min-h-[46px] flex items-center justify-center">
        <div
          id="gsi-button"
          className="flex w-full max-w-sm items-center justify-center"
        />
        {googleLoading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/80 backdrop-blur-[1px] px-4 py-2.5 text-sm font-semibold text-slate-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Carregando...
          </div>
        )}
      </div>

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
                autoComplete="name"
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
                autoComplete="username"
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
            autoComplete="email"
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
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </div>

        {/* Erros são exibidos no alerta acima */}

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
        {mode === "login" && (
          <div className="mt-3">
            <a
              href="/profile/recover"
              className="text-sm text-[#0b203a] hover:underline"
            >
              Esqueci minha senha
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
