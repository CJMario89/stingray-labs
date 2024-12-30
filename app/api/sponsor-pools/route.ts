import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET() {
  const sponsorPools = await prisma.sponsor_pool.findMany();
  return Response.json(SuperJSON.serialize(sponsorPools).json);
}
