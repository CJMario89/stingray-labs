import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(req: Request) {
  const url = new URL(req.url);
  const owner = url.searchParams.get("owner");
  if (!owner) {
    return Response.error();
  }
  const card =
    (await prisma.trader_card.findFirst({
      where: {
        owner_address: owner,
      },
    })) ?? null;
  return Response.json(SuperJSON.serialize(card).json);
}
