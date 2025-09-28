"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Mail, MapPin, Edit, LogOut, Upload, Sun, Moon } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { useTheme } from "@/hooks/use-theme";
import type { AuthUser, ProfileResponse } from "../types";
import { DEFAULT_SESSION_DURATION_MS } from "../utils/session";

const PLACEHOLDER_TEXT = {
  bio: "Adicione uma descrição",
  city: "Adicione sua cidade",
};

const getInitials = (name?: string) => {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const first = String(parts[0]?.[0] ?? "");
  const last = String(parts[parts.length - 1]?.[0] ?? "");

  const initials = `${first}${last}`.trim();
  return initials.length > 0 ? initials.toUpperCase() : "?";
};

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

type StatusState = { type: "success" | "error"; message: string } | null;

type ProfileProps = {
  user: AuthUser;
  onLogout: () => void;
  onUserUpdate: (updater: (user: AuthUser) => AuthUser) => void;
};

export default function Profile({
  user,
  onLogout,
  onUserUpdate,
}: ProfileProps) {
  const [theme, toggleTheme, mounted] = useTheme();
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
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!user.refreshToken) {
      return user.token ?? null;
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const promise = (async () => {
      try {
        const response = await fetch(buildApiUrl("/api/users/refresh"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: user.refreshToken }),
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setStatus({
              type: "error",
              message: "Sessão expirada. Faça login novamente.",
            });
            onLogout();
          } else {
            setStatus({
              type: "error",
              message: "Não foi possível atualizar sua sessão agora.",
            });
          }
          return null;
        }

        const data = (await response.json()) as {
          success?: boolean;
          token?: string;
          refreshToken?: string;
          tokenExpiresAt?: number;
          expiresIn?: number;
        };

        if (!data?.success || !data.token) {
          return null;
        }

        const resolvedExpiry =
          data.tokenExpiresAt ??
          (typeof data.expiresIn === "number"
            ? Date.now() + data.expiresIn * 1000
            : undefined);

        onUserUpdate((currentUser) => ({
          ...currentUser,
          token: data.token ?? currentUser.token,
          refreshToken: data.refreshToken ?? currentUser.refreshToken,
          tokenExpiresAt: resolvedExpiry ?? currentUser.tokenExpiresAt,
          expiresAt: Date.now() + DEFAULT_SESSION_DURATION_MS,
        }));

        return data.token;
      } catch (error) {
        console.error("Falha ao atualizar token:", error);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, [onLogout, onUserUpdate, user.refreshToken, user.token]);

  const getValidToken = useCallback(
    async (forceRefresh = false): Promise<string | null> => {
      const currentToken = user.token ?? null;

      if (!currentToken) {
        return null;
      }

      if (!forceRefresh) {
        const tokenExpiry = user.tokenExpiresAt;
        if (!tokenExpiry || tokenExpiry - Date.now() > REFRESH_THRESHOLD_MS) {
          return currentToken;
        }
      }

      const refreshedToken = await refreshAccessToken();
      return refreshedToken ?? currentToken;
    },
    [refreshAccessToken, user.token, user.tokenExpiresAt]
  );

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
      onUserUpdate((currentUser) => ({
        ...currentUser,
        name: profile.fullName,
        email: profile.email,
        username: profile.username,
        avatarUrl: profile.avatarUrl ?? undefined,
      }));
    },
    [onUserUpdate]
  );

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setStatus(null);

    try {
      let token = await getValidToken();

      if (!token) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      let response = await fetch(buildApiUrl("/api/profile/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken && refreshedToken !== token) {
          token = refreshedToken;
          response = await fetch(buildApiUrl("/api/profile/me"), {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      if (response.status === 401 || response.status === 403) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        setStatus({
          type: "error",
          message:
            errorBody?.message ?? "Não foi possível carregar seu perfil agora.",
        });
        return;
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
  }, [getValidToken, onLogout, persistUser, refreshAccessToken]);

  useEffect(() => {
    // Chama fetchProfile apenas uma vez ao montar
    void fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setIsSaving(true);
    setStatus(null);

    const payload = {
      fullName: profileData.fullName?.trim(),
      bio: profileData.bio?.trim() ?? "",
      city: profileData.city?.trim() ?? "",
    };

    try {
      let token = await getValidToken();

      if (!token) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      let response = await fetch(buildApiUrl("/api/profile/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken && refreshedToken !== token) {
          token = refreshedToken;
          response = await fetch(buildApiUrl("/api/profile/me"), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
        }
      }

      if (response.status === 401 || response.status === 403) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        setStatus({
          type: "error",
          message: errorBody?.message ?? "Não foi possível atualizar o perfil.",
        });
        return;
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

    setIsUploading(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      let token = await getValidToken();

      if (!token) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      let response = await fetch(buildApiUrl("/api/profile/me/avatar"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken && refreshedToken !== token) {
          token = refreshedToken;
          response = await fetch(buildApiUrl("/api/profile/me/avatar"), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        }
      }

      if (response.status === 401 || response.status === 403) {
        setStatus({
          type: "error",
          message: "Sessão expirada. Faça login novamente.",
        });
        onLogout();
        return;
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        setStatus({
          type: "error",
          message: errorBody?.message ?? "Não foi possível enviar a nova foto.",
        });
        return;
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

  const handleLogoutClick = async () => {
    setStatus(null);

    try {
      await fetch(buildApiUrl("/api/users/logout"), {
        method: "POST",
        headers: user.token
          ? {
              Authorization: `Bearer ${user.token}`,
            }
          : undefined,
      }).catch((error) => {
        console.error("Falha ao encerrar sessão no servidor:", error);
      });
    } finally {
      onLogout();
    }
  };

  const avatarUrl = profileData.avatarUrl ?? user.avatarUrl;
  const displayName = profileData.fullName || user.name || "Usuário";
  const displayBio = profileData.bio?.trim() ?? "";
  const displayCity = profileData.city?.trim() ?? "";

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-xl dark:shadow-[0_0_50px_rgba(15,23,42,0.45)] overflow-hidden min-h-screen sm:min-h-0 transition-colors duration-300">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-amber-500 dark:from-slate-900 dark:via-indigo-950 dark:to-black relative overflow-hidden transition-colors duration-300">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white dark:bg-slate-700 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-16 right-0 w-24 h-24 bg-white dark:bg-slate-700 rounded-full translate-x-12"></div>
          <div className="absolute bottom-0 left-16 w-20 h-20 bg-white dark:bg-slate-700 rounded-full translate-y-10"></div>
        </div>

        <div className="relative px-6 py-8 sm:px-8 sm:py-12">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              {avatarUrl && avatarUrl.trim() ? (
                <div className="relative">
                  <Image
                    key={avatarUrl}
                    src={avatarUrl}
                    alt={`Foto de ${displayName}`}
                    width={120}
                    height={120}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-neutral-800 shadow-xl object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-neutral-800 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-600 dark:text-neutral-200 shadow-xl">
                  {getInitials(displayName)}
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-100 dark:border-neutral-700"
              >
                <Upload className="h-4 w-4 text-gray-600 dark:text-neutral-200" />
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

            <div className="space-y-2">
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(event) =>
                    handleFieldChange("fullName", event.target.value)
                  }
                  className="w-full text-center text-xl sm:text-2xl font-bold text-white bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 placeholder-white/70 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Seu nome completo"
                />
              ) : (
                <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                  {displayName}
                </h1>
              )}
              <p className="text-sm sm:text-base text-white/90 font-medium">
                @{profileData.username}
              </p>
            </div>
          </div>

          {/* Theme Toggle - Mobile Only */}
          <div className="flex justify-center mt-6 sm:hidden">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-white/30 dark:hover:bg-white/20 transition-all"
              aria-label="Alternar tema claro/escuro"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {mounted && theme === "dark" ? "Modo claro" : "Modo escuro"}
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">
        {status && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
            }`}
          >
            {status.message}
          </div>
        )}

        {/* Bio Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-900 rounded-2xl p-6 shadow-sm dark:shadow-[0_20px_45px_rgba(15,23,42,0.35)] border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-100 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            Sobre mim
          </h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={profileData.bio ?? ""}
              onChange={(event) => handleFieldChange("bio", event.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 px-4 py-3 text-gray-700 dark:text-neutral-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-neutral-900/80 shadow-sm"
              rows={4}
              placeholder={PLACEHOLDER_TEXT.bio}
            />
          ) : (
            <p
              className={`text-gray-700 dark:text-neutral-200 leading-relaxed ${
                displayBio ? "" : "italic text-gray-400 dark:text-neutral-500"
              }`}
            >
              {displayBio || PLACEHOLDER_TEXT.bio}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-neutral-900 dark:to-neutral-900 rounded-2xl p-6 shadow-sm dark:shadow-[0_20px_45px_rgba(15,23,42,0.35)] border border-gray-100 dark:border-neutral-800 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 dark:bg-emerald-400 rounded-full"></div>
            Informações de contato
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-neutral-900/70 rounded-lg border border-transparent dark:border-neutral-800 transition-colors">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wide font-medium">
                  Email
                </p>
                <p className="text-gray-800 dark:text-neutral-100 font-medium">
                  {profileData.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-neutral-900/70 rounded-lg border border-transparent dark:border-neutral-800 transition-colors">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-neutral-400 uppercase tracking-wide font-medium">
                  Cidade
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.city ?? ""}
                    onChange={(event) =>
                      handleFieldChange("city", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-white dark:bg-neutral-900/80 dark:text-neutral-100"
                    placeholder={PLACEHOLDER_TEXT.city}
                  />
                ) : (
                  <p
                    className={`text-gray-800 dark:text-neutral-100 font-medium ${
                      displayCity
                        ? ""
                        : "italic text-gray-400 dark:text-neutral-500"
                    }`}
                  >
                    {displayCity || PLACEHOLDER_TEXT.city}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => {
              setStatus(null);
              setIsEditing((prev) => !prev);
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? "Cancelar edição" : "Editar perfil"}
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
          )}

          <button
            onClick={handleLogoutClick}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>

        {isLoading && (
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/80 px-4 py-3 text-sm text-gray-600 dark:text-neutral-300 text-center transition-colors">
            Carregando informações do perfil...
          </div>
        )}
      </div>
    </div>
  );
}
