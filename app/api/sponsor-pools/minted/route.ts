import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sponsorPoolId = url.searchParams.get("sponsorPoolId");

  const whereClause = [];

  if (sponsorPoolId) {
    whereClause.push({
      id: sponsorPoolId,
    });
  }

  const sponsorPools = await prisma.mint_fund_manager_voucher.findMany({
    ...(whereClause.length > 0 && { where: { AND: whereClause } }),
  });

  return Response.json(SuperJSON.serialize(sponsorPools).json);
}
