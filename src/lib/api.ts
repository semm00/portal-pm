const DEFAULT_API_BASE_URL = "http://localhost:4000";

const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const getApiBaseUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!raw) {
    return DEFAULT_API_BASE_URL;
  }

  const withoutTrailingSlash = stripTrailingSlashes(raw);

  if (withoutTrailingSlash.toLowerCase().endsWith("/api")) {
    return withoutTrailingSlash.slice(0, -4) || DEFAULT_API_BASE_URL;
  }

  return withoutTrailingSlash;
};

export const buildApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  if (!path.startsWith("/")) {
    return `${baseUrl}/${path}`;
  }
  return `${baseUrl}${path}`;
};
