const DEFAULT_API_BASE_URL = "http://localhost:4000";

const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const getApiBaseUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!raw) {
    return DEFAULT_API_BASE_URL;
  }

  let normalized = stripTrailingSlashes(raw);

  if (normalized.toLowerCase().endsWith("/api")) {
    normalized = stripTrailingSlashes(normalized.slice(0, -4));
  }

  return normalized || DEFAULT_API_BASE_URL;
};

export const buildApiUrl = (path: string): string => {
  if (!path) {
    return getApiBaseUrl();
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (
    baseUrl.toLowerCase().endsWith("/api") &&
    normalizedPath.startsWith("/api/")
  ) {
    return `${baseUrl}${normalizedPath.slice(4)}`;
  }

  return `${baseUrl}${normalizedPath}`;
};
