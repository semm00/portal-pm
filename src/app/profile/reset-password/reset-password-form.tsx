"use client";

import React, { useEffect, useState } from "react";

type ResetPasswordFormProps = {
  accessToken?: string | null;
};

const sanitizeToken = (token?: string | null) => {
  if (!token) {
    return undefined;
  }

  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export default function ResetPasswordForm({
  accessToken,
}: ResetPasswordFormProps) {
  const sanitizedPropToken = sanitizeToken(accessToken);
  const [token, setToken] = useState<string | undefined>(sanitizedPropToken);
  const [tokenChecked, setTokenChecked] = useState<boolean>(
    () => Boolean(sanitizedPropToken)
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const apiEnv = process.env.NEXT_PUBLIC_API_URL || "";
  const cleanedBase = apiEnv.endsWith("/") ? apiEnv.slice(0, -1) : apiEnv;
  const endpoint = cleanedBase
    ? `${cleanedBase}/api/users/reset-password`
    : "/api/users/reset-password";

  useEffect(() => {
    const sanitized = sanitizeToken(accessToken);
    if (sanitized) {
      setToken(sanitized);
      setTokenChecked(true);
      setStatus((prev) => (prev === "success" ? prev : "idle"));
      return;
    }

    if (typeof window === "undefined") {
      setToken(undefined);
      setTokenChecked(true);
      setStatus((prev) => (prev === "success" ? prev : "error"));
      return;
    }

    const hashString = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hashString);
    const hashToken = sanitizeToken(
      hashParams.get("access_token") ?? hashParams.get("token")
    );

    setToken(hashToken);
    setTokenChecked(true);
    if (!hashToken) {
      setStatus((prev) => (prev === "success" ? prev : "error"));
    } else {
      setStatus((prev) => (prev === "success" ? prev : "idle"));
    }
  }, [accessToken]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      return;
    }

    if (password.length < 8 || password !== confirmPassword) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token, password }),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (!tokenChecked) {
    return (
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-2xl font-bold mb-4">Redefinir senha</h1>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded">
          Verificando link de recuperação...
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-2xl font-bold mb-4">Redefinir senha</h1>
        <div className="p-4 bg-red-50 border border-red-100 rounded">
          Link inválido ou expirado. Solicite uma nova recuperação de senha.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Redefinir senha</h1>
      {status === "success" ? (
        <div className="p-4 bg-green-50 border border-green-100 rounded">
          Senha redefinida com sucesso. Você já pode fazer login com a nova
          senha.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700">Nova senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 block w-full rounded border px-3 py-2"
              required
              minLength={8}
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Confirmar senha</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 block w-full rounded border px-3 py-2"
              required
              minLength={8}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded bg-[#fca311] px-4 py-2 font-semibold text-white"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Salvando..." : "Redefinir senha"}
          </button>

          {status === "error" && (
            <p className="text-sm text-red-600">
              Não foi possível redefinir a senha. Verifique os dados e tente
              novamente.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
