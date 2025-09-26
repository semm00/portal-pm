"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  BarChart3,
  MapPin,
  Calendar,
  Eye,
  Megaphone,
  Tag,
} from "lucide-react";

// --- TIPOS E DADOS MOCK ---

export type PostCategory =
  | "avisos"
  | "eventos"
  | "enquetes"
  | "locais"
  | "outro";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
    handle: string;
  };
  category: PostCategory;
  content: string;
  images?: string[];
  poll?: {
    question: string;
    options: PollOption[];
  };
  likes: number;
  views: number;
  createdAt: string; // ISO date string
  location?: string;
  eventDate?: string; // ISO date string
}

// Função para formatar tempo relativo
const timeAgo = (date: string) => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "a";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "min";
  return Math.floor(seconds) + "s";
};

// Dados Fictícios
const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Prefeitura de Padre Marcos",
      avatarUrl: "/images/brasao-municipal.jpg",
      handle: "@prefeiturapm",
    },
    category: "avisos",
    content:
      "Atenção, moradores! A coleta de lixo terá horário especial no feriado de 7 de Setembro. Fique atento aos novos horários no seu bairro.",
    likes: 128,
    views: 2300,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
  },
  {
    id: "2",
    author: {
      name: "Secretaria de Cultura",
      avatarUrl: "/images/logo-portal.png",
      handle: "@culturapm",
    },
    category: "eventos",
    content:
      "Vem aí a 2ª Semana Cultural de Padre Marcos! Shows, apresentações e muita arte para toda a família. Confira a programação completa!",
    images: [
      "/images/slide-1.jpg",
      "/images/slide-2.jpg",
      "/images/slide-3.png",
    ],
    likes: 345,
    views: 5600,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Praça Central",
  },
  {
    id: "3",
    author: {
      name: "Câmara de Vereadores",
      avatarUrl: "/images/brasao-municipal.jpg",
      handle: "@camarapm",
    },
    category: "enquetes",
    content:
      "Qual área você acredita que deve ser prioridade para investimentos no próximo ano em nossa cidade?",
    poll: {
      question: "Área prioritária para 2026:",
      options: [
        { id: "opt1", text: "Saúde", votes: 150 },
        { id: "opt2", text: "Educação", votes: 120 },
        { id: "opt3", text: "Infraestrutura", votes: 95 },
        { id: "opt4", text: "Segurança", votes: 80 },
      ],
    },
    likes: 78,
    views: 1200,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
  },
];

// --- SUB-COMPONENTES ---

// Carrossel de Imagens
function ImageCarousel({ images }: { images: string[] }) {
  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200/80 flex snap-x snap-mandatory scroll-smooth scrollbar-hide">
      {images.map((src, index) => (
        <div key={index} className="w-full flex-shrink-0 snap-center">
          <Image
            src={src}
            alt={`Imagem ${index + 1} do post`}
            width={600}
            height={400}
            className="object-cover w-full h-auto"
          />
        </div>
      ))}
    </div>
  );
}

// Enquete
function Poll({ poll }: { poll: Post["poll"] }) {
  if (!poll) return null;
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="mt-3 space-y-2">
      <h4 className="font-semibold text-slate-800">{poll.question}</h4>
      {poll.options.map((option) => {
        const percentage =
          totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        return (
          <div key={option.id} className="relative">
            <button className="w-full text-left text-sm border border-slate-300 rounded-full px-4 py-2 hover:bg-slate-100 transition-colors">
              {option.text}
            </button>
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-[#fca311]/30"
              style={{ width: `${percentage}%` }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0b203a]">
              {Math.round(percentage)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Card de Post Individual
function PostCard({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    setIsLiked((prev) => !prev);
  };

  const categoryStyles = {
    avisos: { icon: Megaphone, color: "text-red-500", label: "Aviso" },
    eventos: { icon: Calendar, color: "text-blue-500", label: "Evento" },
    enquetes: { icon: BarChart3, color: "text-green-500", label: "Enquete" },
    locais: { icon: MapPin, color: "text-purple-500", label: "Local" },
    outro: { icon: Tag, color: "text-slate-500", label: "Outro" },
  };

  const CategoryIcon = categoryStyles[post.category].icon;
  const categoryColor = categoryStyles[post.category].color;
  const categoryLabel = categoryStyles[post.category].label;

  return (
    <article className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col gap-3">
        {/* Header do Post */}
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={post.author.avatarUrl}
              alt={`Avatar de ${post.author.name}`}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <h3 className="font-bold text-slate-900">{post.author.name}</h3>
              <p className="text-sm text-slate-500">{post.author.handle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className={`flex items-center gap-1.5 ${categoryColor}`}>
              <CategoryIcon className="h-4 w-4" />
              <span className="font-semibold text-xs">{categoryLabel}</span>
            </div>
            <span>{timeAgo(post.createdAt)}</span>
            <button className="hover:bg-slate-100 rounded-full p-1.5">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Conteúdo do Post */}
        <div className="space-y-3">
          <p className="text-slate-800 whitespace-pre-wrap">{post.content}</p>
          {post.images && <ImageCarousel images={post.images} />}
          {post.poll && <Poll poll={post.poll} />}
        </div>

        {/* Footer do Post (Ações e Infos) */}
        <footer className="flex flex-col gap-3 pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 group ${
                  isLiked ? "text-[#fca311]" : "hover:text-[#fca311]"
                }`}
              >
                <Heart
                  className={`h-5 w-5 group-hover:text-[#fca311] transition-colors ${
                    isLiked ? "fill-current" : "fill-none"
                  }`}
                />
                <span className="font-medium">{likes}</span>
              </button>
              <button className="flex items-center gap-1.5 group hover:text-blue-500">
                <MessageCircle className="h-5 w-5 group-hover:text-blue-500 transition-colors" />
                <span className="font-medium">Comentar</span>
              </button>
              <button className="flex items-center gap-1.5 group hover:text-green-500">
                <Share2 className="h-5 w-5 group-hover:text-green-500 transition-colors" />
                <span className="font-medium">Compartilhar</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Eye className="h-4 w-4" />
              <span>{post.views.toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}

// --- COMPONENTE PRINCIPAL ---

export default function Posts() {
  const [posts] = useState<Post[]>(mockPosts);

  // Funções para interagir com o backend (ex: fetch, like, etc.) viriam aqui

  return (
    <section className="w-full space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
