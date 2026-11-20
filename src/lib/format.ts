/** Price is stored as USD per 1M tokens. */
export function formatPrice(perMillion: number): string {
  if (perMillion === 0) return "Free";
  if (perMillion < 0.01) return `$${perMillion.toFixed(3)}`;
  if (perMillion < 1) return `$${perMillion.toFixed(2)}`;
  return `$${perMillion.toFixed(2)}`;
}

export function formatPricePerMillion(perMillion: number): string {
  return `${formatPrice(perMillion)} / 1M tokens`;
}

export function formatContext(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n}`;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export const MODEL_TYPES = [
  "chat",
  "reasoning",
  "multimodal",
  "code",
  "image",
  "audio",
  "embedding",
] as const;

export const TYPE_LABELS: Record<string, string> = {
  chat: "Chat",
  reasoning: "Reasoning",
  multimodal: "Multimodal",
  code: "Code",
  image: "Image",
  audio: "Audio",
  embedding: "Embedding",
};

export const SORT_OPTIONS = [
  { value: "popular", label: "Most capable first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "context-desc", label: "Context: largest first" },
  { value: "context-asc", label: "Context: smallest first" },
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name A–Z" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];
