import { getFundStatistics } from "@/app/common";
import { formatSuiPrice } from "@/common";
import { prisma } from "@/prisma";
import { Fund } from "@/type";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  console.log(url, "url");
  const types = url.searchParams.getAll("types");
  const order = url.searchParams.get("order") as "asc" | "desc";
  const orderBy = url.searchParams.get("orderBy");
  const searchText = url.searchParams.get("searchText");
  const owner = url.searchParams.get("owner");

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
      ...(whereClause.length > 0
        ? {
            OR: [...whereClause],
            ...(!!searchText
              ? {
                  AND: {
                    OR: [
                      { name: { contains: searchText } },
                      { description: { contains: searchText } },
                    ],
                  },
                }
              : {}),
            ...(!!owner
              ? {
                  owner_id: owner,
                }
              : {}),
          }
        : {}),
    },
    include: {
      fund_history: true,
    },
    ...(isEmptyOrderClause ? {} : { orderBy: orderClause }),
  });

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
        type: getPoolType(fund),
      })),
    ).json,
  );
}

function getPoolType(pool: Fund) {
  if (pool.start_time > Date.now()) {
    return "pending";
  } else if (
    pool.start_time <= Date.now() &&
    pool.invest_end_time >= Date.now()
  ) {
    return "funding";
  } else if (
    pool.invest_end_time < Date.now() &&
    pool.end_time >= Date.now() &&
    pool?.settle_result?.length === 0
  ) {
    return "trading";
  } else if (
    pool.end_time < Date.now() ||
    (pool?.settle_result?.length ?? 0) > 0
  ) {
    return "ended";
  }
}
