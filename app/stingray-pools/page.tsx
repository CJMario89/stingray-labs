"use client";

import useGetPools from "@/application/query/pool/use-get-pools";
import TraderInfo from "@/common/trader-info";
import IconSearch from "@/components/icons/search";
import IconSortDown from "@/components/icons/sort-down";
import IconSortDownAlt from "@/components/icons/sort-down-alt";
import { Fund } from "@/type";
import { ChangeEvent, useRef, useState } from "react";
import { throttle } from "../common";
import useGetBalance from "@/application/query/use-get-balance";
import useAddFund from "@/application/mutation/use-add-fund";
export const secondaryGradient =
  "bg-[linear-gradient(90deg,_rgba(10,10,10,0.6)_0%,_rgba(10,10,10,0.3)_100%)] shadow-lg";

// export const primaryGradient = "bg-gradient-to-br from-black-200 to-base-200";
export const primaryGradient =
  "bg-[linear-gradient(90deg,_rgba(34,40,47,0.3)_0%,_rgba(34,40,47,0.6)_100%)]";

const FundModal = ({ pool }: { pool: Fund }) => {
  const balance = useGetBalance();
  const { mutate: add, isPending: isAdding } = useAddFund();
  const amountRef = useRef<HTMLInputElement>(null);
  return (
    <dialog id="fund-modal" className="modal">
      <div className={`${secondaryGradient} modal-box flex flex-col gap-4`}>
        <h3 className="text-lg font-bold">Add Fund</h3>
        <label className="input flex items-center gap-2 rounded-md">
          <input
            ref={amountRef}
            type="number"
            className="grow"
            placeholder="Amount"
          />
        </label>
        <div className="text-sm text-neutral-400">Balance: {balance} SUI</div>
        <div className="modal-action">
          <div className="flex gap-4">
            <button
              className={`btn btn-primary`}
              onClick={() => {
                if (!amountRef.current) {
                  return;
                }
                add({
                  amount: Number(amountRef.current.value),
                  fundId: pool.object_id,
                });
              }}
            >
              {isAdding ? (
                <span className="loading loading-spinner"></span>
              ) : (
                ""
              )}
              Add
            </button>
            <form method="dialog">
              <button className={`btn ${primaryGradient}`}>Close</button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  );
};

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
    <div className={`${secondaryGradient} stat rounded-md shadow`}>
      <div className="stat-title">{title}</div>
      <div className="stat-value text-3xl font-semibold text-neutral-300">
        {value} {unit}
      </div>
      {/* <div className="stat-desc">From January 1st to February 1st</div> */}
    </div>
  );
};

const FundInfo = ({ pool }: { pool: Fund }) => {
  const previousROI = pool.owner?.settle_result?.[0]?.roi;
  console.log(pool);
  console.log(previousROI);
  return (
    <div className="flex w-full gap-4">
      <div className="flex w-full flex-col gap-4">
        <div className="grid w-full grid-cols-1 gap-4 px-4 md:grid-cols-3">
          <div className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-4">
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
          <div
            className={`${secondaryGradient} flex flex-col justify-between gap-2 rounded-md px-6 py-4`}
          >
            <div className="flex flex-col gap-2">
              <TraderInfo traderCard={pool.owner} />
              <div className="flex items-center justify-between">
                <div>Previous Strategy</div>
                <div>
                  ROI: {!isNaN(Number(previousROI)) ? previousROI : "--"} %
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 grid grid-cols-3 gap-4">
          <div
            className={`${secondaryGradient} col-span-2 flex flex-col gap-2 rounded-md px-6 py-4`}
          >
            <div className="text-[var(--fallback-bc,oklch(var(--bc)/0.6))]">
              Strategy Description
            </div>
            <div className="text-md">{pool?.description}</div>
          </div>
          {pool.type === "funding" ? (
            <>
              <button
                className="btn btn-primary self-end"
                onClick={() => {
                  (
                    document.getElementById("fund-modal") as HTMLDialogElement
                  )?.showModal();
                }}
              >
                Add Fund
              </button>
              <FundModal pool={pool} />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  const [types, setTypes] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("time");
  const [searchText, setSearchText] = useState<string>("");

  const onSearch = throttle((e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setSearchText(e.target.value);
  }, 500);

  const {
    data: pools,
    isPending,
    isLoading,
  } = useGetPools({
    types,
    order,
    orderBy,
    searchText,
  });
  const typeOptions = ["pending", "funding", "trading", "ended"];

  const orderOptions = ["time", "roi", "funding amount"];
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col">
        <label
          className={`${secondaryGradient} input flex items-center gap-2 rounded-md`}
        >
          <input
            type="text"
            className="grow"
            placeholder="Search"
            onChange={(e) => {
              onSearch(e);
            }}
          />
          <IconSearch />
        </label>
        <div className="mt-4 flex flex-col justify-between md:flex-row md:items-center">
          <div className="flex gap-1 md:gap-4">
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
              className={`select select-bordered select-sm w-full max-w-xs ${secondaryGradient}`}
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
          <div
            key={pool.object_id}
            className={`collapse collapse-arrow rounded-md ${primaryGradient}`}
          >
            <input type="checkbox" name="pool" />
            <div className="collapse-title px-6 text-xl font-medium">
              <div className="grid w-full grid-cols-3 items-center gap-4">
                <div className="whitespace-nowrap">{pool.name}</div>
                <div className="hidden md:block">
                  <TraderInfo traderCard={pool.owner} />
                </div>
                <div className="hidden items-center text-lg font-semibold md:block">
                  {Number(
                    (
                      (Number(pool?.totalFunded) / Number(pool?.limit_amount)) *
                      100
                    ).toFixed(2),
                  )}
                  % Funded
                </div>
              </div>
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
