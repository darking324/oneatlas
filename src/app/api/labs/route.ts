import { getLabs } from "@/lib/models";

export async function GET() {
  const labs = await getLabs();
  return Response.json({ labs });
}
