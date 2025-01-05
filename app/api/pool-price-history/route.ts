import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  // const types = url.searchParams.getAll("types");
  const fundId = url.searchParams.get("fundId");
  if (!fundId) {
    return Response.json(
      {
        error: "fundId is required",
      },
      {
        status: 400,
      },
    );
  }
  const records = await prisma.fund_balance_record.findMany({
    where: {
      fund_object_id: fundId,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  return Response.json(
    SuperJSON.serialize(
      records
        .filter((record) => Number(record.total) > 0)
        .map((record) => ({
          time: record.timestamp,
          value: record.total,
        })),
    ).json,
  );
}
