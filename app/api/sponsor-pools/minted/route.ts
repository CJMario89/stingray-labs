import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sponsorPoolId = url.searchParams.get("sponsorPoolId");
  const minter = url.searchParams.get("minter");

  const whereClause = [];

  if (sponsorPoolId) {
    whereClause.push({ sponsor_pool_id: sponsorPoolId });
  }

  if (minter) {
    whereClause.push({ minter });
  }

  const sponsorPools = await prisma.mint_fund_manager_voucher.findMany({
    ...(whereClause.length > 0 ? { where: { AND: whereClause } } : {}),
  });

  return Response.json(SuperJSON.serialize(sponsorPools).json);
}
