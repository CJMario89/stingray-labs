import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const owner = url.searchParams.get("owner");
  if (!owner) {
    return Response.json(
      {
        error: "owner is required",
      },
      {
        status: 400,
      },
    );
  }

  const lastFund = await prisma.fund.findFirst({
    where: {
      owner_id: owner,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  if (!lastFund) {
    return Response.json({
      history: [],
      roi: "--",
    });
  }

  const records = await prisma.fund_balance_record.findMany({
    where: {
      fund_object_id: lastFund.object_id,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  if (records.length === 0) {
    return Response.json({
      history: [],
      roi: "--",
    });
  }

  const lastPrice = records[records.length - 1]?.total;
  const initPrice = records[0]?.total;

  return Response.json(
    SuperJSON.serialize({
      history: records
        .filter((record) => !(Number(record.total) > 0))
        .map((record) => ({
          time: record.timestamp,
          value: record.total,
        })),
      roi: ((lastPrice - initPrice) / initPrice).toFixed(2),
    }).json,
  );
}
