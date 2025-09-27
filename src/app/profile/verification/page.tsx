"use client";

import React, { useEffect, useState } from "react";

export default function VerificationPage() {
  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || "";
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");
    const typeParam = params.get("type") ?? undefined;
    if (!token || !email) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      setStatus("verifying");
      try {
        const res = await fetch(`${API}/api/users/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email, type: typeParam }),
        });
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    verify();
  }, []);

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Verificar e-mail</h1>
      {status === "verifying" && <div>Verificando...</div>}
      {status === "success" && (
        <div className="p-4 bg-green-50 border border-green-100 rounded">
          E-mail verificado com sucesso.
        </div>
      )}
      {status === "error" && (
        <div className="p-4 bg-red-50 border border-red-100 rounded">
          Token inválido ou expirado.
        </div>
      )}
      {status === "idle" && <div>Processando verificação...</div>}
      {status === "error" && (
        <div className="mt-4 text-sm text-slate-600">
          Caso o link não funcione, tente acessar novamente a partir do e-mail
          recebido ou solicite um novo envio na tela de login.
        </div>
      )}
    </div>
  );
}
