import { getFundStatistics, getQuery, investTypeDuration } from "@/app/common";
import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET(req: Request) {
  const querys = getQuery({ req, keys: ["duration"] });
  const duration = querys.duration;
  const durationTime = investTypeDuration[duration]; //type
  const funds = await prisma.fund.findMany({
    where: {
      trade_duration: durationTime,
      NOT: {
        arena_object_id: {
          equals: null,
        },
      },
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
