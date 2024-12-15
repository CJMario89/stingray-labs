import { getFundStatistics, getQuery, investTypeDuration } from "@/app/common";
import { prisma } from "@/prisma";

export const revalidate = 0;

export async function GET(req: Request) {
  const querys = getQuery({ req, keys: ["duration", "address"] });
  const duration = querys.duration;
  const durationTime = investTypeDuration[duration]; // type
  const address = querys.address;
  const funds = await prisma.fund.findMany({
    where: {
      start_time: {
        lte: Date.now(),
      },
      invest_end_time: {
        gte: Date.now(),
      },
      trade_duration: durationTime,
      fund_history: {
        some: {
          investor: address,
        },
      },
    },
    include: {
      fund_history: true,
    },
  });

  return Response.json(
    funds.map((fund) => ({
      ...fund,
      ...getFundStatistics(fund),
    })),
  );
}
