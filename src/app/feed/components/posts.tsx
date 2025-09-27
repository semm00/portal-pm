"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Share2,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

type PollData = {
  question: string;
  options: Array<{ id: string; text: string; votes: number }>;
};

type ApiPost = {
  id: string;
  authorName: string;
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
  { icon: LucideIcon; label: string; color: string }
> = {
  avisos: { icon: Megaphone, label: "Aviso", color: "text-red-500" },
  eventos: { icon: Calendar, label: "Evento", color: "text-blue-500" },
  enquetes: { icon: BarChart3, label: "Enquete", color: "text-green-500" },
  locais: { icon: MapPin, label: "Local", color: "text-purple-500" },
  outro: { icon: Tag, label: "Outro", color: "text-slate-500" },
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
      color: "text-slate-500",
    }
  );
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
              className="relative w-full flex-shrink-0 snap-center overflow-hidden bg-slate-950/5"
              style={{ aspectRatio: "16 / 9" }}
            >
              {isVideo ? (
                <video
                  controls
                  className="h-full w-full object-cover"
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
                  className="object-cover"
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
  likePending: boolean;
  sharePending: boolean;
  reportPending: boolean;
  onPollUpdated: (postId: string, poll: PollData) => void;
}

function PostCard({
  post,
  isLiked,
  onToggleLike,
  onShare,
  onReport,
  likePending,
  sharePending,
  reportPending,
  onPollUpdated,
}: PostCardProps) {
  const categoryConfig = useMemo(
    () => getCategoryConfig(post.category),
    [post.category]
  );
  const CategoryIcon = categoryConfig.icon;

  const handleLikeClick = () => {
    if (!likePending) {
      onToggleLike(post.id, isLiked);
    }
  };

  return (
    <article className="rounded-3xl border border-[#0b203a]/10 bg-white p-5 shadow-sm shadow-[#0b203a]/10 transition-shadow hover:shadow-md">
      <header className="flex flex-col gap-3 border-b border-slate-200/70 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Image
            src={post.authorAvatarUrl || FALLBACK_AVATAR}
            alt={`Avatar de ${post.authorName}`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border border-slate-200 object-cover"
          />
          <div>
            <h3 className="text-base font-semibold text-[#0b203a]">
              {post.authorName || "Morador"}
            </h3>
            <p className="text-sm text-slate-500">
              {slugifyHandle(post.authorName || "Morador")}
            </p>
            <p className="text-xs text-slate-400">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide">
          {post.alertUsers && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#fca311]/10 px-3 py-1 text-[#c25700]">
              <Megaphone className="h-3.5 w-3.5" />
              Alerta
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${categoryConfig.color} border-current`}
          >
            <CategoryIcon className="h-3.5 w-3.5" />
            {categoryConfig.label}
          </span>
          <button
            type="button"
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Mais ações"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="space-y-4 pt-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {post.content}
        </p>

        {(post.location || post.eventDate) && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            {post.location && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <MapPin className="h-3.5 w-3.5 text-[#0b203a]" />
                {post.location}
              </span>
            )}
            {formatEventDate(post.eventDate) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Calendar className="h-3.5 w-3.5 text-[#0b203a]" />
                {formatEventDate(post.eventDate)}
              </span>
            )}
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

      <footer className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={likePending}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-medium transition-colors ${
              isLiked
                ? "border-[#fca311] bg-[#fca311]/20 text-[#b76808]"
                : "border-slate-200 hover:border-[#fca311] hover:bg-[#fca311]/10 hover:text-[#b76808]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {likePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isLiked ? "fill-current" : "fill-none"
                }`}
              />
            )}
            <span>{post.likes}</span>
          </button>

          <button
            type="button"
            onClick={() => !sharePending && onShare(post)}
            disabled={sharePending}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 font-medium transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sharePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span>{post.shares}</span>
          </button>

          <button
            type="button"
            onClick={() => !reportPending && onReport(post)}
            disabled={reportPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reportPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Flag className="h-4 w-4" />
            )}
            Denunciar
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          Conteúdo enviado pela comunidade
        </div>
      </footer>
    </article>
  );
}

interface PostsProps {
  refreshKey?: number;
}

export default function Posts({ refreshKey = 0 }: PostsProps) {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likePending, setLikePending] = useState<string | null>(null);
  const [sharePending, setSharePending] = useState<string | null>(null);
  const [reportPending, setReportPending] = useState<string | null>(null);

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
  }, [fetchPosts, refreshKey]);

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
        const shareData = {
          title: "Mural Digital - Portal PM",
          text: post.content,
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

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={likedPosts[post.id] ?? false}
            onToggleLike={handleToggleLike}
            onShare={handleShare}
            onReport={handleReport}
            likePending={likePending === post.id}
            sharePending={sharePending === post.id}
            reportPending={reportPending === post.id}
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
          {new Date().toLocaleString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
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
