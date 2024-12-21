import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(req: Request) {
  const url = new URL(req.url);
  const whereClause: Record<string, string> = {};
  const owner = url.searchParams.get("owner");
  if (!!owner) {
    whereClause["owner_address"] = owner;
  }

  const objectId = url.searchParams.get("objectId");

  if (!!objectId) {
    whereClause["object_id"] = objectId;
  }

  const card =
    (await prisma.trader_card.findFirst({
      where: whereClause,
      include: {
        settle_result: {
          orderBy: {
            event_seq: "desc",
          },
          take: 1,
        },
      },
    })) ?? null;
  return Response.json(SuperJSON.serialize(card).json);
}
