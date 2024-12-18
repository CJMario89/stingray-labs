"use client";

import useGetPools from "@/application/query/pool/use-get-pools";
import IconSearch from "@/components/icons/search";
import IconSortDown from "@/components/icons/sort-down";
import IconSortDownAlt from "@/components/icons/sort-down-alt";
import { Fund } from "@/type";
import { useState } from "react";

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
  const [types, setTypes] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("time");
  const {
    data: pools,
    isPending,
    isLoading,
  } = useGetPools({
    types,
    order,
    orderBy,
  });
  const typeOptions = ["pending", "funding", "trading", "ended"];

  const orderOptions = ["time", "roi", "funding amount"];
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col">
        <label className="input flex items-center gap-2 rounded-md">
          <input type="text" className="grow" placeholder="Search" />
          <IconSearch />
        </label>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-4">
            {typeOptions.map((type) => (
              <div className="form-control" key={type}>
                <label className="label flex cursor-pointer items-center gap-2">
                  <span className="label-text">{type}</span>
                  <input
                    type="checkbox"
                    name="type"
                    className="checked cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTypes([...types, type]);
                      } else {
                        setTypes(types.filter((t) => t !== type));
                      }
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm px-2"
              onClick={() => {
                setOrder(order === "asc" ? "desc" : "asc");
              }}
            >
              {order === "asc" ? <IconSortDownAlt /> : <IconSortDown />}
            </button>

            <select
              className="select select-bordered select-sm w-full max-w-xs"
              onChange={(e) => {
                setOrderBy(e.target.value);
              }}
              value={orderBy}
            >
              {orderOptions.map((order) => (
                <option key={order} value={order}>
                  {order}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {isPending &&
          !isLoading &&
          Array.from(Array(3)).map((_, i) => (
            <div key={i} className="skeleton h-[60px] w-full rounded-md" />
          ))}
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
