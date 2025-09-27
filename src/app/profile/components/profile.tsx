"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Mail, MapPin, Edit, LogOut, Shield, Bell, Upload } from "lucide-react";
import type { AuthUser, ProfileResponse } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:4000";

const PLACEHOLDER_TEXT = {
  bio: "Adicione uma descrição",
  city: "Adicione sua cidade",
};

const initialsFromName = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

type StatusState = { type: "success" | "error"; message: string } | null;

type ProfileProps = {
  user: AuthUser;
  onLogout: () => void;
  onUserUpdate: (user: AuthUser) => void;
};

export default function Profile({
  user,
  onLogout,
  onUserUpdate,
}: ProfileProps) {
  const baseProfile: ProfileResponse = useMemo(
    () => ({
      fullName: user.name ?? "Usuário",
      email: user.email ?? "",
      username:
        user.username ?? (user.email ? user.email.split("@")[0] : "usuario"),
      avatarUrl: user.avatarUrl,
      bio: "",
      city: "",
    }),
    [user.avatarUrl, user.email, user.name, user.username]
  );

  const [profileData, setProfileData] = useState<ProfileResponse>(baseProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<StatusState>(null);

  useEffect(() => {
    setProfileData((prev) => ({
      ...prev,
      fullName: baseProfile.fullName,
      email: baseProfile.email,
      username: baseProfile.username,
      avatarUrl: baseProfile.avatarUrl,
    }));
  }, [baseProfile]);

  const persistUser = useCallback(
    (profile: ProfileResponse) => {
      const updatedUser: AuthUser = {
        ...user,
        name: profile.fullName,
        email: profile.email,
        username: profile.username,
        avatarUrl: profile.avatarUrl ?? undefined,
      };
      onUserUpdate(updatedUser);
    },
    [onUserUpdate, user]
  );

  const fetchProfile = useCallback(async () => {
    if (!user.token) {
      setIsLoading(false);
      setStatus({
        type: "error",
        message: "Sessão expirada. Faça login novamente.",
      });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.status === 401) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error("Falha ao carregar o perfil.");
      }

      const data = (await response.json()) as {
        success: boolean;
        profile: ProfileResponse;
      };

      if (data.success && data.profile) {
        setProfileData(data.profile);
        persistUser(data.profile);
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Não foi possível carregar seu perfil agora.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [onLogout, persistUser, user.token]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleFieldChange = (
    field: "fullName" | "bio" | "city",
    value: string
  ) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user.token) {
      setStatus({
        type: "error",
        message: "Sessão expirada. Faça login novamente.",
      });
      onLogout();
      return;
    }

    setIsSaving(true);
    setStatus(null);

    const payload = {
      fullName: profileData.fullName?.trim(),
      bio: profileData.bio?.trim() ?? "",
      city: profileData.city?.trim() ?? "",
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error("Falha ao atualizar o perfil.");
      }

      const data = (await response.json()) as {
        success: boolean;
        profile: ProfileResponse;
      };

      if (data.success) {
        setProfileData(data.profile);
        persistUser(data.profile);
        setIsEditing(false);
        setStatus({
          type: "success",
          message: "Perfil atualizado com sucesso!",
        });
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Não foi possível atualizar o perfil.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user.token) {
      setStatus({
        type: "error",
        message: "Sessão expirada. Faça login novamente.",
      });
      onLogout();
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${API_BASE_URL}/api/profile/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error("Falha ao atualizar a foto de perfil.");
      }

      const data = (await response.json()) as {
        success: boolean;
        profile: ProfileResponse;
      };

      if (data.success) {
        setProfileData(data.profile);
        persistUser(data.profile);
        setStatus({
          type: "success",
          message: "Foto atualizada com sucesso!",
        });
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Não foi possível enviar a nova foto.",
      });
    } finally {
      event.target.value = "";
      setIsUploading(false);
    }
  };

  const avatarUrl = profileData.avatarUrl ?? user.avatarUrl;
  const displayName = profileData.fullName || user.name || "Usuário";
  const displayBio = profileData.bio?.trim() ?? "";
  const displayCity = profileData.city?.trim() ?? "";

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#0b203a] to-[#153b69] h-40 relative">
        <div className="absolute -bottom-20 left-8 flex items-end gap-4">
          <div className="relative">
            {avatarUrl ? (
              <Image
                key={avatarUrl}
                src={avatarUrl}
                alt={`Foto de ${displayName}`}
                width={144}
                height={144}
                className="rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-3xl font-semibold text-slate-600 shadow-lg">
                {initialsFromName(displayName)}
              </div>
            )}

            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow hover:bg-white disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Enviando..." : "Alterar foto"}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end p-4 mt-6">
        <button
          onClick={() => {
            setStatus(null);
            setIsEditing((prev) => !prev);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all mr-2"
        >
          <Edit className="h-4 w-4" />
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </button>
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>

      <div className="p-8 pt-2">
        {status && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {isEditing ? (
            <input
              type="text"
              value={profileData.fullName}
              onChange={(event) =>
                handleFieldChange("fullName", event.target.value)
              }
              className="w-full max-w-xl rounded-lg border border-slate-300 px-3 py-2 text-3xl font-bold text-[#0b203a] focus:border-[#fca311] focus:ring-1 focus:ring-[#fca311]"
            />
          ) : (
            <h1 className="text-3xl font-bold text-[#0b203a]">{displayName}</h1>
          )}
          <p className="text-md text-slate-500">@{profileData.username}</p>
        </div>

        <div className="mt-6 space-y-4">
          {isEditing ? (
            <textarea
              name="bio"
              value={profileData.bio ?? ""}
              onChange={(event) => handleFieldChange("bio", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-700 focus:border-[#fca311] focus:ring-1 focus:ring-[#fca311]"
              rows={4}
              placeholder={PLACEHOLDER_TEXT.bio}
            />
          ) : (
            <p
              className={`text-slate-700 ${
                displayBio ? "" : "italic text-slate-400"
              }`}
            >
              {displayBio || PLACEHOLDER_TEXT.bio}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-200 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="h-5 w-5 text-[#fca311]" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-5 w-5 text-[#fca311]" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.city ?? ""}
                    onChange={(event) =>
                      handleFieldChange("city", event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#fca311] focus:ring-1 focus:ring-[#fca311]"
                    placeholder={PLACEHOLDER_TEXT.city}
                  />
                ) : (
                  <span className={displayCity ? "" : "italic text-slate-400"}>
                    {displayCity || PLACEHOLDER_TEXT.city}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <button className="flex items-center gap-3 text-slate-600 hover:text-[#0b203a] w-full text-left">
                <Shield className="h-5 w-5 text-slate-400" />
                <span>Segurança e Privacidade</span>
              </button>
              <button className="flex items-center gap-3 text-slate-600 hover:text-[#0b203a] w-full text-left">
                <Bell className="h-5 w-5 text-slate-400" />
                <span>Notificações</span>
              </button>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setStatus(null);
                void fetchProfile();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900"
            >
              Descartar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b203a] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#13335c] transition-all disabled:opacity-50"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Carregando informações do perfil...
          </div>
        )}
      </div>
    </div>
  );
}
