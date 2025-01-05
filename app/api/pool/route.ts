import { getFundStatistics } from "@/app/common";
import { formatBasePrice } from "@/common";
import { prisma } from "@/prisma";
import { Fund, SponsorPool } from "@/type";
import SuperJSON from "superjson";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const types = url.searchParams.getAll("types");
  const order = url.searchParams.get("order") as "asc" | "desc";
  const orderBy = url.searchParams.get("orderBy");
  const searchText = url.searchParams.get("searchText");
  const owner = url.searchParams.get("owner");
  const investor = url.searchParams.get("investor");

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
            some: {},
          },
        },
      ],
    });
  }

  if (types.includes("settled")) {
    whereClause.push({
      settle_result: {
        some: {},
      },
    });
  }

  if (types.includes("voucher")) {
    whereClause.push({
      settle_result: {
        none: {},
      },
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

  const isEmptyOrderClause =
    Object.keys(orderClause).length === 0 && orderClause.constructor === Object;

  const funds = await prisma.fund.findMany({
    where: {
      ...(whereClause.length > 0
        ? {
            OR: [...whereClause],
          }
        : {}),
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
      ...(!!investor
        ? {
            fund_history: {
              some: {
                investor,
              },
            },
          }
        : {}),
    },
    include: {
      fund_history: {
        orderBy: {
          timestamp: "desc",
        },
      },
      trader_operation: {
        orderBy: [
          {
            timestamp: "desc",
          },
          {
            event_seq: "desc",
          },
        ],
      },
      settle_result: true,
    },
    ...(isEmptyOrderClause ? {} : { orderBy: orderClause }),
  });

  const sponsorPools = await prisma.sponsor_pool.findMany({
    where: {
      sponsor: {
        in: funds.map((fund) => fund.owner_id),
      },
    },
  });

  return Response.json(
    SuperJSON.serialize(
      funds.map((fund) => ({
        ...fund,
        ...getFundStatistics(fund),
        limit_amount: formatBasePrice(fund.limit_amount),
        fund_history: fund.fund_history.map((history) => ({
          ...history,
          amount: formatBasePrice(history.amount),
        })),
        types: getPoolTypes(fund, sponsorPools),
        sponsorPools: sponsorPools.filter(
          (pool) => pool.sponsor === fund.owner_id,
        ),
      })),
    ).json,
  );
}

function getPoolTypes(pool: Fund, sponsorPools: SponsorPool[]) {
  const types = [];
  if (pool.start_time > Date.now()) {
    types.push("pending");
  } else if (
    pool.start_time <= Date.now() &&
    pool.invest_end_time >= Date.now()
  ) {
    types.push("funding");
  } else if (
    pool.invest_end_time < Date.now() &&
    pool.end_time >= Date.now() &&
    pool?.settle_result?.length === 0
  ) {
    types.push("trading");
  } else if (
    pool.end_time < Date.now() ||
    (pool?.settle_result?.length ?? 0) > 0
  ) {
    types.push("ended");
  }

  if (pool?.settle_result && pool?.settle_result?.length > 0) {
    types.push("settled");
  }

  if (
    sponsorPools.some((sponsorPool) => sponsorPool.sponsor === pool.owner_id)
  ) {
    types.push("voucher");
  }

  return types;
}
