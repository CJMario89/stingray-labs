import { getFundStatistics } from "@/app/common";
import { formatSuiPrice } from "@/common";
import { prisma } from "@/prisma";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  console.log(url, "url");
  const types = url.searchParams.getAll("types");
  const order = url.searchParams.get("order") as "asc" | "desc";
  const orderBy = url.searchParams.get("orderBy");
  console.log("types", types);
  console.log("order", order);
  console.log("orderBy", orderBy);

  const whereClause = [];

  if (types.includes("pending")) {
    whereClause.push({
      start_time: {
        gte: Date.now(),
      },
    });
  }

  if (types.includes("funding")) {
    whereClause.push({
      start_time: {
        lte: Date.now(),
      },
      invest_end_time: {
        gte: Date.now(),
      },
    });
  }

  if (types.includes("trading")) {
    whereClause.push({
      invest_end_time: {
        lte: Date.now(),
      },
      end_time: {
        gte: Date.now(),
      },
      settle_result: {
        none: {},
      },
      // arena_object_id: {
      //   equals: null,
      // },
    });
  }

  if (types.includes("ended")) {
    whereClause.push({
      OR: [
        {
          end_time: {
            lte: Date.now(),
          },
        },
        {
          settle_result: {
            none: {},
          },
        },
      ],
    });
  }

  const orderClause: Record<string, "asc" | "desc"> = {};

  if (!!orderBy) {
    switch (orderBy) {
      case "time":
        orderClause["timestamp"] = order;
        break;
      case "roi":
        orderClause["expected_roi"] = order;
        break;
      case "funding amount":
        orderClause["limit_amount"] = order;
        break;
    }
  }

  console.log(orderClause, "orderClause");

  const isEmptyOrderClause =
    Object.keys(orderClause).length === 0 && orderClause.constructor === Object;

  const funds = await prisma.fund.findMany({
    where: {
      ...(whereClause.length > 0 ? { OR: [...whereClause] } : {}),
    },
    include: {
      fund_history: true,
    },
    ...(isEmptyOrderClause ? {} : { orderBy: orderClause }),
  });
  console.log({ ...(isEmptyOrderClause ? {} : { orderBy: orderClause }) });
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
