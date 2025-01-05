import { getFundStatistics } from "@/app/common";
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
    include: {
      fund_history: true,
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

  const rawRecords = await prisma.fund_balance_record.findMany({
    where: {
      fund_object_id: lastFund.object_id,
    },
    orderBy: {
      timestamp: "asc",
    },
  });
  const records = rawRecords.filter((record) => Number(record.total) > 0);

  if (records.length === 0) {
    return Response.json({
      history: [],
      roi: "--",
    });
  }

  const lastPrice = records[records.length - 1]?.total;
  const initPrice = Number(getFundStatistics(lastFund).totalFunded);

  const initTime = lastFund?.invest_end_time;

  return Response.json(
    SuperJSON.serialize({
      history: [
        {
          time: initTime,
          value: initPrice,
        },
        ...(records.map((record) => ({
          time: record.timestamp,
          value: record.total,
        })) ?? []),
      ],
      roi: ((lastPrice - initPrice) / initPrice).toFixed(2),
    }).json,
  );
}
