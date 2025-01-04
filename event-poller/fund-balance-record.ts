import { PrismaClient } from "@prisma/client";
import { CronJob } from "cron";
import qs from "qs";
import { v4 as uuid } from "uuid";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRequest(url: string, params?: any) {
  const apiUrl = "http://localhost:3000";
  const queryString = qs.stringify(params, {
    arrayFormat: "repeat",
    encode: true,
  });

  const requestUrl =
    queryString.length === 0
      ? `${apiUrl}${url}`
      : `${apiUrl}${url}?${queryString}`;

  return fetch(requestUrl, {
    method: "GET",
  });
}

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const job = CronJob.from({
  cronTime: "*/60 * * * * *",
  onTick: async function () {
    const response = await getRequest("/api/pool", {
      types: ["trading"],
    });
    const pools = await response.json();
    const records = await Promise.all(
      pools.map(async (pool: { object_id: string }) => {
        const response = await getRequest(`/api/pool-balance/statistics`, {
          fundId: pool.object_id,
        });
        const balance = await response.json();

        return {
          id: uuid(),
          fund_object_id: pool.object_id,
          total: balance.total,
          trading: balance.trading,
          farming: balance.farming,
          timestamp: Date.now(),
        };
      }),
    );

    await prisma.fund_balance_record.createMany({
      data: records,
    });
  },
  start: true,
  timeZone: "America/Los_Angeles",
});

job.start();
