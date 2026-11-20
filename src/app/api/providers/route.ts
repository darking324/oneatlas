import { getProviders } from "@/lib/models";

export async function GET() {
  const providers = await getProviders();
  return Response.json({ providers });
}
