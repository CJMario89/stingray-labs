"use client";
import useGetPools from "@/application/query/use-get-pools";
import { primaryGradient } from "@/components/pool-list-template";
import Decimal from "decimal.js";

const Page = () => {
  const { data: pools } = useGetPools({
    types: ["trading"],
  });

  const totalValueLocked = pools?.reduce(
    (acc, pool) =>
      new Decimal(acc).plus(new Decimal(pool.totalFunded || "0")).toString(),
    "0",
  );

  const overviewStats = [
    { title: "Total Strategies", value: 0, unit: "Funded" },
    { title: "Total Value Locked", value: totalValueLocked, unit: "USDC" },
    { title: "Total Profit Created", value: 0, unit: "USDC" },
  ];

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-semibold">Protocol Overview</div>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {overviewStats.map((stat) => (
            <div
              className={`stat rounded-md ${primaryGradient} shadow`}
              key={stat.title}
            >
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value text-3xl font-semibold text-neutral-300">
                {stat.value} {stat.unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
