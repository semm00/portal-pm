"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type VerificationStatus =
  | "idle"
  | "verifying"
  | "success"
  | "already"
  | "error";

const StatusPill = ({ status }: { status: VerificationStatus }) => {
  const labelMap: Record<VerificationStatus, string> = {
    idle: "Processando",
    verifying: "Verificando",
    success: "Tudo certo!",
    already: "Já confirmado",
    error: "Algo deu errado",
  };

  const fillMap: Record<VerificationStatus, string> = {
    idle: "bg-slate-100 text-slate-600",
    verifying: "bg-blue-100 text-blue-600",
    success: "bg-emerald-100 text-emerald-700",
    already: "bg-emerald-50 text-emerald-700",
    error: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${fillMap[status]}`}
    >
      {labelMap[status]}
    </span>
  );
};

const MessageBlock = ({ status }: { status: VerificationStatus }) => {
  const content = {
    idle: {
      title: "Aguarde um instante",
      body: "Estamos preparando a validação do seu link de confirmação.",
    },
    verifying: {
      title: "Verificando seu endereço",
      body: "Isso pode levar alguns segundos. Não feche esta página.",
    },
    success: {
      title: "E-mail confirmado!",
      body: "Sua conta está ativa e você já pode acessar o portal com suas credenciais.",
    },
    already: {
      title: "E-mail já estava confirmado",
      body: "Identificamos que o seu endereço já foi validado antes. Você pode fazer login normalmente.",
    },
    error: {
      title: "Não conseguimos validar o link",
      body: "O link pode ter expirado ou já ter sido utilizado. Solicite um novo envio ou tente novamente.",
    },
  } as const;

  const { title, body } = content[status];

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
};

const ActionButtons = ({
  status,
  email,
}: {
  status: VerificationStatus;
  email?: string;
}) => {
  if (status === "verifying" || status === "idle") {
    return null;
  }

  if (status === "success" || status === "already") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/profile"
          className="inline-flex w-full items-center justify-center rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ffb735] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fca311]"
        >
          Ir para o portal
        </Link>
        <Link
          href="/profile/login"
          className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          Fazer login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href={
          email
            ? `/profile/verification?email=${encodeURIComponent(email)}`
            : "/profile"
        }
        className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-slate-400"
      >
        Solicitar novo envio
      </Link>
      <Link
        href="/profile/login"
        className="inline-flex w-full items-center justify-center rounded-md bg-[#fca311] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ffb735] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fca311]"
      >
        Voltar para o login
      </Link>
    </div>
  );
};

export default function VerificationPage() {
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const apiEnv = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanedBase = apiEnv.endsWith("/") ? apiEnv.slice(0, -1) : apiEnv;
    const endpoint = cleanedBase
      ? `${cleanedBase}/api/users/verify-email`
      : "/api/users/verify-email";
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash
    );

    const tokenParam = params.get("token") ?? hashParams.get("token");
    const accessTokenParam =
      hashParams.get("access_token") ?? params.get("access_token");
    const emailParam =
      params.get("email") ?? hashParams.get("email") ?? undefined;
    const typeParam = params.get("type") ?? hashParams.get("type") ?? undefined;

    if (emailParam) {
      setEmail(emailParam);
    }

    if (!tokenParam && !accessTokenParam) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      try {
        const payload: Record<string, unknown> = {};
        if (typeParam) {
          payload.type = typeParam;
        }
        if (tokenParam) {
          payload.token = tokenParam;
        }
        if (emailParam) {
          payload.email = emailParam;
        }
        if (accessTokenParam) {
          payload.accessToken = accessTokenParam;
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await res.json().catch(() => null)) as {
          success: boolean;
          alreadyVerified?: boolean;
          email?: string;
        } | null;

        if (data?.email) {
          setEmail(data.email);
        }

        if (res.ok) {
          const already = data?.alreadyVerified ?? false;
          setStatus(already ? "already" : "success");
        } else {
          if (data?.alreadyVerified) {
            setStatus("already");
            return;
          }
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    verify();
  }, []);

  const showLoader = useMemo(
    () => status === "verifying" || status === "idle",
    [status]
  );

  return (
    <div className="min-h-[70vh] bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-8 shadow-md ring-1 ring-slate-100">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Confirmação de e-mail
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Estamos finalizando seu cadastro
            </h1>
          </div>
          <StatusPill status={status} />
        </div>

        <div className="space-y-8">
          <MessageBlock status={status} />

          {showLoader && (
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-[#fca311]" />
              Validando token enviado para {email ?? "seu e-mail"}.
            </div>
          )}

          <ActionButtons status={status} email={email} />

          {status === "error" && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              Se o problema persistir, peça um novo link na tela de login ou
              entre em contato com o suporte da prefeitura.
            </div>
          )}

          {(status === "success" || status === "already") && (
            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Dica: já deixe seu login salvo ou ative o lembrete no navegador
              para acessar o portal com mais facilidade.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
