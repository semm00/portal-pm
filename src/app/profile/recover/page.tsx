"use client";

import React, { useState } from "react";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      const res = await fetch(`${API}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Recuperar senha</h1>
      {status === "sent" ? (
        <div className="p-4 bg-green-50 border border-green-100 rounded">
          Um e-mail com instruções foi enviado se o e-mail estiver cadastrado.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border px-3 py-2"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full rounded bg-[#fca311] px-4 py-2 font-semibold text-white"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Enviando..." : "Enviar instruções"}
          </button>

          {status === "error" && (
            <div className="text-red-600">
              Ocorreu um erro. Tente novamente mais tarde.
            </div>
          )}
        </form>
      )}
    </div>
  );
}
