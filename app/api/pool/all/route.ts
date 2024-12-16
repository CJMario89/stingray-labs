import { getFundStatistics } from "@/app/common";
import { formatSuiPrice } from "@/common";
import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET() {
  const funds = await prisma.fund.findMany({
    where: {
      arena_object_id: {
        equals: null,
      },
    },
    include: {
      fund_history: true,
    },
  });
  console.log();
  return Response.json(
    SuperJSON.serialize(
      funds.map((fund) => ({
        ...fund,
        ...getFundStatistics(fund),
        limit_amount: formatSuiPrice(fund.limit_amount),
        fund_history: fund.fund_history.map((history) => ({
          ...history,
          amount: formatSuiPrice(history.amount),
        })),
      })),
    ).json,
  );
}
