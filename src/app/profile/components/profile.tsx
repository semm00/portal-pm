"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Edit,
  LogOut,
  Shield,
  Bell,
  Upload,
  Sun,
  Moon,
} from "lucide-react";
import { buildApiUrl } from "@/lib/api";
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

type Theme = "light" | "dark";

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

function useTheme(): [Theme, () => void, boolean] {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      const initial: Theme = stored === "dark" ? "dark" : "light";
      setTheme(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
    } catch {
      // noop
    }
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // noop
    }
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return [theme, toggle, mounted];
}

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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-sky-200 to-amber-200 h-20 sm:h-40 relative">
        <div className="absolute inset-x-4 sm:inset-x-auto sm:left-8 -bottom-20 sm:-bottom-24 flex flex-col items-center sm:flex-row sm:items-end sm:justify-start gap-4">
          <div className="relative">
            {avatarUrl && avatarUrl.trim() ? (
              <Image
                key={avatarUrl}
                src={avatarUrl}
                alt={`Foto de ${displayName}`}
                width={144}
                height={144}
                className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-lg object-cover"
                unoptimized
              />
            ) : (
              <div className="flex w-24 h-24 sm:w-36 sm:h-36 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-xl sm:text-3xl font-semibold text-slate-600 shadow-lg select-none">
                {getInitials(displayName)}
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

          <div className="flex w-full max-w-full flex-col items-center gap-1 text-center sm:mb-6 sm:w-auto sm:items-start sm:text-left">
            {isEditing ? (
              <input
                type="text"
                value={profileData.fullName}
                onChange={(event) =>
                  handleFieldChange("fullName", event.target.value)
                }
                className="w-full max-w-full rounded-lg border border-slate-300 px-3 py-2 text-3xl font-bold text-[#0b203a] focus:border-[#fca311] focus:ring-1 focus:ring-[#fca311] sm:max-w-xl"
              />
            ) : (
              <h1 className="text-3xl font-bold text-[#0b203a]">
                {displayName}
              </h1>
            )}
            <p className="text-md text-slate-500 break-words">
              @{profileData.username}
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow hover:bg-white sm:hidden"
            aria-label="Alternar tema claro/escuro"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 text-sky-700" />
            )}
            {mounted && theme === "dark" ? "Modo claro" : "Modo escuro"}
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 pt-32 sm:pt-20 lg:pt-24 pb-8">
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

        <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-start">
          <button
            onClick={() => {
              setStatus(null);
              setIsEditing((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? "Cancelar" : "Editar Perfil"}
          </button>
          <button
            onClick={handleLogoutClick}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end gap-3">
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
