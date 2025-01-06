import { prisma } from "@/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fundId = url.searchParams.get("fundId");
  if (!fundId) {
    return Response.error();
  }
  const claim = await prisma.trader_claim.findFirst();

  return Response.json(claim);
}
