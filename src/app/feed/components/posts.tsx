"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Flag,
  Heart,
  Loader2,
  MapPin,
  Megaphone,
  MoreVertical,
  RefreshCcw,
  Search,
  Share2,
  Tag,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { loadSession } from "@/app/profile/utils/session";
import type { FilterType } from "./header";

type PollData = {
  question: string;
  options: Array<{ id: string; text: string; votes: number }>;
};

type ApiPost = {
  id: string;
  authorId?: string | null;
  authorName: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  content: string;
  category: string;
  location?: string | null;
  eventDate?: string | null;
  poll?: PollData | null;
  alertUsers: boolean;
  likes: number;
  shares: number;
  createdAt: string;
  media: Array<{ id: string; url: string; mimeType: string }>;
};

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

const FALLBACK_AVATAR = "/images/logo-portal.png";

const categoryConfigs: Record<
  string,
  { icon: LucideIcon; label: string; badgeClass: string }
> = {
  avisos: {
    icon: Megaphone,
    label: "Aviso",
    badgeClass: "border border-[#fcd5a6] bg-[#fff5e7] text-[#a04b03]",
  },
  eventos: {
    icon: Calendar,
    label: "Evento",
    badgeClass: "border border-[#c6dcff] bg-[#eef3ff] text-[#1d4ed8]",
  },
  enquetes: {
    icon: BarChart3,
    label: "Enquete",
    badgeClass: "border border-[#c8f2d8] bg-[#f0fff5] text-[#15803d]",
  },
  locais: {
    icon: MapPin,
    label: "Local",
    badgeClass: "border border-[#e0d5ff] bg-[#f6f3ff] text-[#6d28d9]",
  },
  outro: {
    icon: Tag,
    label: "Outro",
    badgeClass: "border border-slate-200 bg-slate-50 text-slate-600",
  },
};

const slugifyHandle = (value: string) =>
  `@${
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "") || "morador"
  }`;

const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "há instantes";
  }

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  let duration = seconds;
  let unitIndex = 0;

  while (
    unitIndex < intervals.length &&
    Math.abs(duration) >= intervals[unitIndex][0]
  ) {
    duration /= intervals[unitIndex][0];
    unitIndex += 1;
  }

  const unit = intervals[Math.min(unitIndex, intervals.length - 1)][1];
  return rtf.format(-Math.round(duration), unit);
};

const formatEventDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getCategoryConfig = (category: string) => {
  const normalized = category?.toLowerCase?.() ?? "outro";
  return (
    categoryConfigs[normalized] ?? {
      icon: Tag,
      label: category || "Outro",
      badgeClass: "border border-slate-200 bg-slate-50 text-slate-600",
    }
  );
};

const formatDisplayName = (value?: string | null) => {
  if (!value) return "Morador";

  return value
    .trim()
    .split(/\s+/)
    .map(
      (part) =>
        part.charAt(0).toLocaleUpperCase("pt-BR") +
        part.slice(1).toLocaleLowerCase("pt-BR")
    )
    .join(" ");
};

interface PollProps {
  postId: string;
  poll: NonNullable<ApiPost["poll"]>;
  onPollUpdated?: (poll: PollData) => void;
}

function Poll({ postId, poll, onPollUpdated }: PollProps) {
  const [currentPoll, setCurrentPoll] = useState<PollData>(poll);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPoll(poll);
  }, [poll]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(`portalpm.poll.vote.${postId}`);
    setHasVoted(Boolean(stored));
  }, [postId]);

  if (!currentPoll || currentPoll.options.length === 0) return null;

  const totalVotes = currentPoll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting) return;
    setIsVoting(true);
    setVoteError(null);

    try {
      const response = await fetch(
        buildApiUrl(`/api/posts/${postId}/poll/vote`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ optionId }),
        }
      );

      const data = await response.json().catch(() => ({ success: false }));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Não foi possível registrar seu voto agora."
        );
      }

      const updatedPoll: PollData = {
        question: data.poll?.question ?? currentPoll.question,
        options: Array.isArray(data.poll?.options)
          ? data.poll.options
          : currentPoll.options,
      };

      setCurrentPoll(updatedPoll);
      onPollUpdated?.(updatedPoll);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(`portalpm.poll.vote.${postId}`, optionId);
      }

      setHasVoted(true);
    } catch (error) {
      setVoteError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao registrar seu voto."
      );
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="mt-4 space-y-2 rounded-2xl border border-[#0b203a]/15 bg-[#0b203a]/5 p-4">
      <h4 className="font-semibold text-[#0b203a]">{currentPoll.question}</h4>
      {voteError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {voteError}
        </p>
      )}
      <div className="space-y-2">
        {currentPoll.options.map((option) => {
          const percent =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

          if (!hasVoted) {
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleVote(option.id)}
                disabled={isVoting}
                className="flex w-full items-center justify-between rounded-full border border-[#0b203a]/15 bg-white px-4 py-2 text-sm font-medium text-[#0b203a] transition-colors hover:bg-[#0b203a]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{option.text}</span>
                {isVoting && (
                  <Loader2 className="h-4 w-4 animate-spin text-[#0b203a]" />
                )}
              </button>
            );
          }

          return (
            <div
              key={option.id}
              className="relative overflow-hidden rounded-full border border-[#0b203a]/10 bg-white"
            >
              <div
                className="absolute inset-0 bg-[#fca311]/20"
                style={{ width: `${percent}%` }}
              />
              <div className="relative flex items-center justify-between px-4 py-2 text-sm">
                <span className="font-medium text-[#0b203a]">
                  {option.text}
                </span>
                <span className="text-xs font-semibold text-[#0b203a]/80">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[#0b203a]/70">
        {totalVotes} {totalVotes === 1 ? "voto" : "votos"}
        {hasVoted && " · Você já votou"}
      </p>
    </div>
  );
}

function MediaCarousel({ media }: { media: ApiPost["media"] }) {
  if (!media || media.length === 0) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80">
      <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide">
        {media.map((item, index) => {
          const isVideo = item.mimeType?.startsWith("video/");
          return (
            <div
              key={item.id || `${item.url}-${index}`}
              className="relative w-full flex-shrink-0 snap-center overflow-hidden bg-slate-950/5 max-h-96"
            >
              {isVideo ? (
                <video
                  controls
                  className="h-full w-full object-contain max-h-96"
                  preload="metadata"
                >
                  <source src={item.url} type={item.mimeType || "video/mp4"} />
                  Seu navegador não suporta vídeos incorporados.
                </video>
              ) : (
                <Image
                  src={item.url}
                  alt={`Mídia ${index + 1} do post`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 680px"
                  priority={index === 0}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PostCardProps {
  post: ApiPost;
  isLiked: boolean;
  onToggleLike: (postId: string, liked: boolean) => void;
  onShare: (post: ApiPost) => void;
  onReport: (post: ApiPost) => void;
  onDelete: (postId: string) => void;
  likePending: boolean;
  sharePending: boolean;
  reportPending: boolean;
  deletePending: boolean;
  onPollUpdated: (postId: string, poll: PollData) => void;
}

function PostCard({
  post,
  isLiked,
  onToggleLike,
  onShare,
  onReport,
  onDelete,
  likePending,
  sharePending,
  reportPending,
  deletePending,
  onPollUpdated,
}: PostCardProps) {
  const categoryConfig = useMemo(
    () => getCategoryConfig(post.category),
    [post.category]
  );
  const CategoryIcon = categoryConfig.icon;
  const displayName = useMemo(
    () => formatDisplayName(post.authorName),
    [post.authorName]
  );
  const userHandle = useMemo(
    () => `@${post.authorUsername || slugifyHandle(displayName).slice(1)}`,
    [post.authorUsername, displayName]
  );
  const eventLabel = useMemo(
    () => formatEventDate(post.eventDate),
    [post.eventDate]
  );

  const infoItems = useMemo(() => {
    const items: Array<{ key: string; icon: LucideIcon; label: string }> = [];

    if (post.location) {
      items.push({ key: "location", icon: MapPin, label: post.location });
    }

    if (eventLabel) {
      items.push({ key: "eventDate", icon: Calendar, label: eventLabel });
    }

    return items;
  }, [eventLabel, post.location]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const session = loadSession();

  const isAuthor = session?.id === post.authorId;

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleLikeClick = () => {
    if (!likePending) {
      onToggleLike(post.id, isLiked);
    }
  };

  const handleMenuReport = () => {
    setIsMenuOpen(false);
    if (!reportPending) {
      onReport(post);
    }
  };

  const handleMenuDelete = () => {
    setIsMenuOpen(false);
    if (!deletePending && isAuthor) {
      onDelete(post.id);
    }
  };

  const likeButtonLabel = isLiked ? "Remover curtida" : "Curtir";
  const likeCountWord = post.likes === 1 ? "curtida" : "curtidas";
  const shareCountWord =
    post.shares === 1 ? "compartilhamento" : "compartilhamentos";

  return (
    <article className="rounded-3xl border border-[#0b203a]/10 bg-white p-5 shadow-sm shadow-[#0b203a]/10 transition-shadow hover:shadow-lg">
      <header className="border-b border-slate-200/60 pb-4">
        <div className="flex items-start gap-3 md:justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Image
              src={post.authorAvatarUrl || FALLBACK_AVATAR}
              alt={`Avatar de ${displayName}`}
              width={52}
              height={52}
              className="h-12 w-12 rounded-full border border-slate-200 object-cover"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#0b203a]">
                  {displayName}
                </h3>
                <div className="flex items-center gap-3 md:hidden">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${categoryConfig.badgeClass}`}
                  >
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {categoryConfig.label}
                  </span>
                  <div ref={actionMenuRef} className="relative">
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={isMenuOpen}
                      onClick={() => setIsMenuOpen((prev) => !prev)}
                      className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#0b203a]/10">
                        {isAuthor && (
                          <button
                            type="button"
                            onClick={handleMenuDelete}
                            disabled={deletePending}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletePending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Excluir post
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleMenuReport}
                          disabled={reportPending}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reportPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Flag className="h-4 w-4" />
                          )}
                          Denunciar post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{userHandle}</span>
                <span className="inline-block h-1 w-1 rounded-full bg-slate-300" />
                <span>{formatRelativeTime(post.createdAt)}</span>
              </div>
              {post.alertUsers && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fce8d7] px-2 py-1 text-[11px] font-semibold text-[#a04b03]">
                  <Megaphone className="h-3.5 w-3.5" />
                  Destaque para todos
                </span>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${categoryConfig.badgeClass}`}
            >
              <CategoryIcon className="h-3.5 w-3.5" />
              {categoryConfig.label}
            </span>
            <div ref={actionMenuRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#0b203a]/10">
                  {isAuthor && (
                    <button
                      type="button"
                      onClick={handleMenuDelete}
                      disabled={deletePending}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletePending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Excluir post
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleMenuReport}
                    disabled={reportPending}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {reportPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Flag className="h-4 w-4" />
                    )}
                    Denunciar post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-4 pt-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {post.content}
        </p>

        {infoItems.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            {infoItems.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </span>
            ))}
          </div>
        )}

        <MediaCarousel media={post.media} />

        {post.poll && (
          <Poll
            postId={post.id}
            poll={post.poll}
            onPollUpdated={(updated) => onPollUpdated(post.id, updated)}
          />
        )}
      </div>

      <footer className="mt-6 flex flex-col gap-3 border-t border-slate-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={likePending}
            aria-pressed={isLiked}
            aria-label={likeButtonLabel}
            className={`inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60 ${
              isLiked ? "bg-rose-50 text-rose-600" : "text-slate-600"
            }`}
          >
            {likePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={`h-4 w-4 ${
                  isLiked ? "fill-rose-500 text-rose-500" : "text-slate-500"
                }`}
              />
            )}
            <span>{post.likes}</span>
            <span className="text-xs font-normal text-slate-400">
              {likeCountWord}
            </span>
          </button>

          <button
            type="button"
            onClick={() => !sharePending && onShare(post)}
            disabled={sharePending}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sharePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span>Compartilhar</span>
          </button>
        </div>

        <div className="text-sm text-slate-500">
          {post.shares} {shareCountWord}
        </div>
      </footer>
    </article>
  );
}

interface PostsProps {
  searchQuery?: string;
  activeFilter?: FilterType;
}

export default function Posts({
  searchQuery = "",
  activeFilter = "todos",
}: PostsProps) {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likePending, setLikePending] = useState<string | null>(null);
  const [sharePending, setSharePending] = useState<string | null>(null);
  const [reportPending, setReportPending] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl("/api/posts"));
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Não foi possível carregar o mural.");
      }

      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setLikedPosts({});
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Falha inesperada ao carregar os posts."
      );
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 6000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const updatePostList = (
    postId: string,
    updater: (post: ApiPost) => ApiPost
  ) => {
    setPosts((prev) =>
      prev.map((item) => (item.id === postId ? updater(item) : item))
    );
  };

  const handlePollUpdated = (postId: string, poll: PollData) => {
    updatePostList(postId, (post) => ({
      ...post,
      poll,
    }));
  };

  const handleToggleLike = async (postId: string, currentlyLiked: boolean) => {
    setLikePending(postId);
    const nextLiked = !currentlyLiked;

    setLikedPosts((prev) => ({ ...prev, [postId]: nextLiked }));
    updatePostList(postId, (post) => ({
      ...post,
      likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)),
    }));

    try {
      const response = await fetch(buildApiUrl(`/api/posts/${postId}/like`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextLiked ? "increment" : "decrement" }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Erro ao registrar curtida.");
      }

      updatePostList(postId, (post) => ({
        ...post,
        likes: typeof data.likes === "number" ? data.likes : post.likes,
      }));
    } catch (err) {
      setLikedPosts((prev) => ({ ...prev, [postId]: currentlyLiked }));
      updatePostList(postId, (post) => ({
        ...post,
        likes: Math.max(0, post.likes + (currentlyLiked ? 1 : -1)),
      }));

      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível registrar sua curtida.",
      });
    } finally {
      setLikePending(null);
    }
  };

  const handleShare = async (post: ApiPost) => {
    setSharePending(post.id);
    updatePostList(post.id, (item) => ({ ...item, shares: item.shares + 1 }));

    try {
      if (typeof window !== "undefined") {
        const shareUrl = `${window.location.origin}/feed?post=${post.id}`;
        const authorDisplay = formatDisplayName(post.authorName);
        const rawSummary = post.content.replace(/\s+/g, " ").trim();
        const summary =
          rawSummary.length > 180 ? `${rawSummary.slice(0, 177)}…` : rawSummary;
        const shareData = {
          title: `${authorDisplay} no Mural Digital`,
          text: summary
            ? summary
            : `Confira a publicação de ${authorDisplay} no Portal PM.`,
          url: shareUrl,
        };

        const nav = window.navigator as Navigator & {
          canShare?: (data?: ShareData) => boolean;
        };

        if (typeof nav.share === "function" && nav.canShare?.(shareData)) {
          await nav.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareUrl);
          setFeedback({
            type: "success",
            message: "Link copiado! Compartilhe com sua rede.",
          });
        }
      }

      const response = await fetch(buildApiUrl(`/api/posts/${post.id}/share`), {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Erro ao registrar compartilhamento.");
      }

      updatePostList(post.id, (item) => ({
        ...item,
        shares: typeof data.shares === "number" ? data.shares : item.shares,
      }));
    } catch (err) {
      updatePostList(post.id, (item) => ({
        ...item,
        shares: Math.max(0, item.shares - 1),
      }));
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível compartilhar agora.",
      });
    } finally {
      setSharePending(null);
    }
  };

  const handleDelete = async (postId: string) => {
    setDeletePending(postId);

    try {
      const session = loadSession();
      if (!session?.token) {
        throw new Error("Faça login para excluir posts.");
      }

      const response = await fetch(buildApiUrl(`/api/posts/${postId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Erro ao excluir post.");
      }

      // Remove o post da lista
      setPosts((prev) => prev.filter((post) => post.id !== postId));

      setFeedback({
        type: "success",
        message: "Post excluído com sucesso.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível excluir o post.",
      });
    } finally {
      setDeletePending(null);
    }
  };

  const handleReport = async (post: ApiPost) => {
    if (typeof window === "undefined") return;

    const reason = window.prompt(
      "Descreva o motivo da denúncia (opcional):",
      ""
    );

    if (reason === null) {
      return;
    }

    setReportPending(post.id);

    try {
      const response = await fetch(
        buildApiUrl(`/api/posts/${post.id}/report`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: reason.trim() || undefined }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Erro ao enviar denúncia.");
      }

      setFeedback({
        type: "success",
        message: "Denúncia registrada. Obrigado por ajudar a moderar o mural.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Não foi possível registrar a denúncia.",
      });
    } finally {
      setReportPending(null);
    }
  };

  const renderContent = () => {
    const normalizedFilter = activeFilter?.toLowerCase?.() ?? "todos";
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredPosts = posts.filter((post) => {
      const category = post.category?.toLowerCase?.() ?? "";
      const matchesFilter =
        normalizedFilter === "todos" || category === normalizedFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const tokens: string[] = [
        post.content,
        post.authorName,
        post.location ?? "",
        post.category ?? "",
        formatEventDate(post.eventDate) ?? "",
        post.poll?.question ?? "",
        ...(post.poll?.options ?? []).map((option) => option.text),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return tokens.some((token) => token.includes(normalizedQuery));
    });

    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-700">
          <AlertTriangle className="h-6 w-6" />
          <p className="text-sm font-medium">{error}</p>
          <button
            type="button"
            onClick={fetchPosts}
            className="inline-flex items-center gap-2 rounded-full bg-[#0b203a] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#13335c]"
          >
            <RefreshCcw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
          <Megaphone className="mx-auto mb-3 h-8 w-8 text-[#fca311]" />
          <p className="text-sm">
            Nenhuma atualização publicada ainda. Seja o primeiro a compartilhar
            algo com a comunidade!
          </p>
        </div>
      );
    }

    if (filteredPosts.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
          <Search className="mx-auto mb-3 h-8 w-8 text-[#0b203a]" />
          <p className="text-sm">
            Não encontramos resultados para a sua busca.
          </p>
          {normalizedQuery && (
            <p className="mt-2 text-xs text-slate-400">
              Tente ajustar as palavras-chave ou limpar os filtros ativos.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={likedPosts[post.id] ?? false}
            onToggleLike={handleToggleLike}
            onShare={handleShare}
            onReport={handleReport}
            onDelete={handleDelete}
            likePending={likePending === post.id}
            sharePending={sharePending === post.id}
            reportPending={reportPending === post.id}
            deletePending={deletePending === post.id}
            onPollUpdated={handlePollUpdated}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="w-full space-y-4">
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm shadow ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {feedback.message}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Atualizado em{" "}
          {lastUpdatedAt
            ? lastUpdatedAt.toLocaleString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"}
        </span>
        <button
          type="button"
          onClick={fetchPosts}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold uppercase tracking-wide text-[#0b203a] transition-colors hover:border-[#0b203a] hover:bg-[#0b203a]/10"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Atualizar
        </button>
      </div>

      {renderContent()}
    </section>
  );
}
