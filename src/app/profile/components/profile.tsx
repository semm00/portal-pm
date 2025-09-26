"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Phone, MapPin, Edit, LogOut, Shield, Bell } from "lucide-react";
import type { AuthUser } from "./login";

// Tipo para os dados do usuário
interface UserProfileData {
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  location: string;
  phone: string;
}

// Dados fictícios do usuário
const fallbackProfile: UserProfileData = {
  name: "Francisco Macedo",
  username: "chico_macedo",
  email: "francisco.macedo@email.com",
  avatarUrl: "/images/francisco-macedo.jpg",
  bio: "Cidadão de Padre Marcos, apaixonado por tecnologia e pelo desenvolvimento da nossa cidade. Contribuindo para um futuro melhor.",
  location: "Padre Marcos, Piauí",
  phone: "(89) 99999-1234",
};

export default function Profile({
  user,
  onLogout,
}: {
  user: AuthUser;
  onLogout: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>(() => ({
    ...fallbackProfile,
    name: user.name ?? fallbackProfile.name,
    email: user.email ?? fallbackProfile.email,
    username: user.username ?? fallbackProfile.username,
  }));

  useEffect(() => {
    setProfileData((prev) => ({
      ...prev,
      name: user.name ?? prev.name,
      email: user.email ?? prev.email,
      username: user.username ?? prev.username,
    }));
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = () => {
    // Aqui viria a lógica para salvar os dados no backend
    console.log("Salvando dados:", profileData);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Cabeçalho do Perfil */}
      <div className="bg-gradient-to-r from-[#0b203a] to-[#153b69] h-32 relative">
        <div className="absolute -bottom-16 left-8">
          <Image
            src={profileData.avatarUrl}
            alt={`Foto de ${profileData.name}`}
            width={128}
            height={128}
            className="rounded-full border-4 border-white shadow-lg"
          />
        </div>
      </div>

      {/* Ações do Perfil */}
      <div className="flex justify-end p-4 mt-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
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

      {/* Informações do Perfil */}
      <div className="p-8 pt-4">
        <h1 className="text-3xl font-bold text-[#0b203a]">
          {profileData.name}
        </h1>
        <p className="text-md text-slate-500">@{profileData.username}</p>

        <div className="mt-6 space-y-4">
          {isEditing ? (
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              className="w-full p-2 border border-slate-300 rounded-lg"
              rows={3}
            />
          ) : (
            <p className="text-slate-700">{profileData.bio}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            {/* Coluna de Informações */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="h-5 w-5 text-[#fca311]" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                ) : (
                  <span>{profileData.email}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="h-5 w-5 text-[#fca311]" />
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                ) : (
                  <span>{profileData.phone}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <MapPin className="h-5 w-5 text-[#fca311]" />
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                ) : (
                  <span>{profileData.location}</span>
                )}
              </div>
            </div>
            {/* Coluna de Configurações */}
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
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b203a] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#13335c] transition-all"
            >
              Salvar Alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
