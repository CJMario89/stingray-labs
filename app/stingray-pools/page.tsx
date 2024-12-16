"use client";

import useGetPools from "@/application/query/pool/use-get-pools";
import IconSearch from "@/components/icons/search";
import { Fund } from "@/type";

const FundStatistics = ({
  title,
  value,
  unit,
}: {
  title: string;
  value: number;
  unit: string;
}) => {
  return (
    <div className="stat shadow">
      <div className="stat-title">{title}</div>
      <div className="stat-value text-3xl font-semibold text-neutral-300">
        {value} {unit}
      </div>
      {/* <div className="stat-desc">From January 1st to February 1st</div> */}
    </div>
  );
};

const FundInfo = ({ pool }: { pool: Fund }) => {
  return (
    <div className="flex w-full gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex flex-col">
            <FundStatistics
              title="Target Funding Amount"
              value={pool.limit_amount}
              unit="USDC"
            />
            <FundStatistics
              title="Total Funding Members"
              value={pool.totalInvestor || 0}
              unit="Members"
            />
          </div>
          <div className="flex flex-col">
            <FundStatistics
              title="Current Funding Amount"
              value={pool.totalFunded || 0}
              unit="USDC"
            />
            <FundStatistics
              title="Minimun Funding Amount"
              value={pool.fund_history?.[0].amount || 0}
              unit="USDC"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 px-6">
          <div className="text-[var(--fallback-bc,oklch(var(--bc)/0.6))]">
            Strategy Description
          </div>
          <div className="text-md">{pool?.description}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-lg font-semibold">APY</div>
        <button className="btn btn-primary">Add Fund</button>
      </div>
    </div>
  );
};

const Page = () => {
  const { data: pools } = useGetPools();
  console.log(pools);
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <label className="input flex items-center gap-2 rounded-md">
        <input type="text" className="grow" placeholder="Search" />
        <IconSearch />
      </label>
      <div className="flex flex-col gap-4">
        {pools?.map((pool) => (
          <div key={pool.object_id} className="collapse rounded-md bg-base-200">
            <input type="radio" name="my-accordion-1" />
            <div className="collapse-title px-6 text-xl font-medium">
              {pool.name}
            </div>
            <div className="collapse-content px-0">
              <FundInfo pool={pool} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
