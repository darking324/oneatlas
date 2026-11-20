import { getModelsBySlugs } from "@/lib/models";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("models") ?? url.searchParams.get("slugs") ?? "";
  const slugs = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 4);
  if (slugs.length < 2) {
    return Response.json(
      { error: "Pass at least 2 model slugs, e.g. ?models=a,b" },
      { status: 400 },
    );
  }
  const models = await getModelsBySlugs(slugs);
  return Response.json({ models });
}
