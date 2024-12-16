import { getFundStatistics } from "@/app/common";
import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET() {
  // const querys = getQuery({ req, keys: ["duration"] });
  // const duration = querys.duration;
  // const durationTime = investTypeDuration[duration]; // type
  const funds = await prisma.fund.findMany({
    where: {
      start_time: {
        lte: Date.now(),
      },
      invest_end_time: {
        gte: Date.now(),
      },
      // trade_duration: durationTime,
    },
    include: {
      fund_history: true,
    },
  });

  return Response.json(
    SuperJSON.serialize(
      funds.map((fund) => ({
        ...fund,
        ...getFundStatistics(fund),
      })),
    ).json,
  );
}
