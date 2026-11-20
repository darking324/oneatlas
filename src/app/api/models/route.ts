import { listModels } from "@/lib/models";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "24", 10) || 24),
  );

  const result = await listModels({
    q: url.searchParams.get("q") ?? undefined,
    labSlug: url.searchParams.get("lab") ?? undefined,
    providerSlug: url.searchParams.get("provider") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    capability: url.searchParams.get("capability") ?? undefined,
    modality: url.searchParams.get("modality") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    page,
    limit,
  });

  return Response.json(result);
}
