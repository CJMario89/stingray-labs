"use client";

import useGetPools from "@/application/query/use-get-pools";
import TraderInfo from "@/common/trader-info";
import IconSearch from "@/components/icons/search";
import IconSortDown from "@/components/icons/sort-down";
import IconSortDownAlt from "@/components/icons/sort-down-alt";
import { Fund } from "@/type";
import { ChangeEvent, useState } from "react";
import SelectMenu from "@/components/select-menu";
import AddFundModal from "@/components/modal/add-fund-modal";
import RemoveFundModal from "@/components/modal/remove-fund-modal";
import IconMinus from "@/components/icons/minus";
import useClaim from "@/application/mutation/use-claim";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { throttle } from "@/app/common";
import Tag from "./common/tag";
import IconVoucher from "./icons/voucher";
import { useRouter } from "next/navigation";
import FundAssets from "./fund/fund-assets";
import FundHistory from "./fund/fund-history";
import Chart from "./chart";
import useGetPoolPriceHistory from "@/application/query/pool/use-get-pool-price-history";
import useGetPrevPoolPrice from "@/application/query/use-get-prev-pool-price";
export const secondaryGradient =
  "bg-[linear-gradient(90deg,_rgba(10,10,10,0.6)_0%,_rgba(10,10,10,0.3)_100%)] shadow-lg";

// export const primaryGradient = "bg-gradient-to-br from-black-200 to-base-200";
export const primaryGradient =
  "bg-[linear-gradient(90deg,_rgba(34,40,47,0.3)_0%,_rgba(34,40,47,0.6)_100%)]";

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

const FundInfo = ({
  investor,
  pool,
  onSuccess,
}: {
  investor?: string;
  pool: Fund;
  onSuccess: () => void;
}) => {
  const { mutate: claim, isPending: isClaiming } = useClaim();
  const account = useCurrentAccount();
  const shares =
    pool?.fund_history
      ?.filter((history) => !history?.redeemed)
      ?.filter((history) => history.investor === account?.address)
      ?.map((history) => history.share_id) || [];
  const hasShares = shares.length > 0;

  const { data: priceHistories } = useGetPoolPriceHistory({
    fundId: pool.object_id,
    enabled:
      Boolean(pool?.types?.includes("trading")) ||
      Boolean(pool?.types?.includes("ended")),
  });

  const { data: prevPoolPrice } = useGetPrevPoolPrice({
    owner: pool.owner_id,
  });

  const { push } = useRouter();

  const lastPrice = priceHistories?.[priceHistories.length - 1]?.value || 0;
  const initPrice = Number(pool.totalFunded) || 0;
  const currentROI = (((lastPrice - initPrice) / initPrice) * 100).toFixed(2);

  const finalAmount = Number(pool.settle_result?.[0]?.final_amount);
  const initAmount =
    initPrice * 10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL);
  const finalROI = finalAmount
    ? (((finalAmount - initAmount) / initAmount) * 100).toFixed(2)
    : "--";

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
              value={pool.fund_history?.[0]?.amount || 0}
              unit="USDC"
            />
          </div>
          <div
            className={`${secondaryGradient} flex flex-col justify-between gap-2 rounded-md px-6 py-4`}
          >
            <div className="flex flex-col gap-2">
              <TraderInfo address={pool.owner_id} />
              {(pool?.types?.includes("pending") ||
                pool?.types?.includes("funding")) && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>Previous</div>
                    <div>
                      ROI:{" "}
                      {!isNaN(Number(prevPoolPrice?.roi))
                        ? prevPoolPrice?.roi
                        : "--"}{" "}
                      %
                    </div>
                  </div>
                  {Array.isArray(prevPoolPrice?.hisotries) &&
                    prevPoolPrice?.hisotries.length > 0 && (
                      <Chart
                        height={100}
                        data={priceHistories}
                        id={pool.object_id}
                      />
                    )}
                </div>
              )}
              {pool?.types?.includes("trading") && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>Current</div>
                    <div>
                      ROI: {!isNaN(Number(currentROI)) ? currentROI : "--"} %
                    </div>
                  </div>
                  {Array.isArray(priceHistories) &&
                    priceHistories?.length > 0 && (
                      <Chart
                        height={100}
                        data={priceHistories}
                        id={pool.object_id}
                      />
                    )}
                </div>
              )}
              {pool?.types?.includes("ended") && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>Final</div>
                    <div>
                      ROI: {!isNaN(Number(finalROI)) ? finalROI : "--"} %
                    </div>
                  </div>
                  {Array.isArray(priceHistories) &&
                    priceHistories?.length > 0 && (
                      <Chart
                        height={100}
                        data={priceHistories}
                        id={pool.object_id}
                      />
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mx-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Boolean(investor) ? (
            <div
              className={`grid grid-cols-1 gap-4 rounded-md md:col-span-2 md:grid-cols-2`}
            >
              <div className={`flex flex-col gap-2`}>
                <div>Fund Assets</div>
                <FundAssets fund={pool} />
              </div>
              <div className={`flex flex-col gap-2`}>
                <div>Fund History</div>
                <FundHistory fund={pool} />
              </div>
            </div>
          ) : (
            <div
              className={`${secondaryGradient} flex flex-col gap-2 rounded-md px-6 py-4 md:col-span-2`}
            >
              <div className="text-sm text-[var(--fallback-bc,oklch(var(--bc)/0.6))]">
                Strategy Description
              </div>
              <div className="tooltip" data-tip={pool?.description}>
                <div className="text-md line-clamp-3 overflow-hidden text-ellipsis text-start">
                  {pool?.description}
                </div>
              </div>
            </div>
          )}
          {pool.types?.includes("funding") && (
            <div className="flex flex-col gap-4">
              <div className="text-xs">Funding end at </div>
              <div className="text-xs">
                {pool?.invest_end_time
                  ? new Date(Number(pool?.invest_end_time)).toLocaleString()
                  : ""}
              </div>
              <div className="flex w-full gap-2 self-end">
                {pool.types?.includes("voucher") && (
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      push(`/sponsor-pools/?pool=${pool.owner_id}`);
                    }}
                  >
                    <IconVoucher />
                  </button>
                )}
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => {
                    (
                      document.getElementById(
                        `add-fund-modal-${pool.object_id}`,
                      ) as HTMLDialogElement
                    )?.showModal();
                  }}
                >
                  Deposit
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    (
                      document.getElementById(
                        `remove-fund-modal-${pool.object_id}`,
                      ) as HTMLDialogElement
                    )?.showModal();
                  }}
                >
                  <IconMinus />
                </button>
                <AddFundModal
                  pool={pool}
                  onSuccess={() => {
                    onSuccess();
                    (
                      document.getElementById(
                        `add-fund-modal-${pool.object_id}`,
                      ) as HTMLDialogElement
                    )?.close();
                  }}
                />
                <RemoveFundModal
                  pool={pool}
                  onSuccess={() => {
                    onSuccess();
                    (
                      document.getElementById(
                        `remove-fund-modal-${pool.object_id}`,
                      ) as HTMLDialogElement
                    )?.close();
                  }}
                />
              </div>
            </div>
          )}
          {pool?.types?.includes("pending") && (
            <div className="flex flex-col gap-4">
              <div className="text-xs">Funding start at </div>
              <div className="text-xs">
                {pool?.start_time
                  ? new Date(Number(pool?.start_time)).toLocaleString()
                  : ""}
              </div>
            </div>
          )}
          {pool?.types?.includes("trading") && (
            <div className="flex flex-col gap-4">
              <div className="text-xs">Trading end at </div>
              <div className="text-xs">
                {pool?.end_time
                  ? new Date(Number(pool?.end_time)).toLocaleString()
                  : ""}
              </div>
              {pool.owner_id === account?.address && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    push(`/trade`);
                  }}
                >
                  Trade
                </button>
              )}
            </div>
          )}
          {pool?.types?.includes("ended") &&
            !pool.types?.includes("settled") &&
            hasShares && (
              <button
                className="btn btn-primary self-end"
                onClick={() => {
                  claim({
                    fund: pool,
                  });
                }}
              >
                {isClaiming && <div className="loading loading-spinner" />}
                Settle
              </button>
            )}
          {pool.types?.includes("settled") && hasShares && (
            <button
              className="btn btn-primary self-end"
              onClick={() => {
                claim({
                  fund: pool,
                });
              }}
            >
              {isClaiming && <div className="loading loading-spinner" />}
              Claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const typeOptions = ["pending", "funding", "trading", "ended", "settled"];

const orderOptions = ["time", "roi", "funding amount"];

const PoolListTemplate = ({ investor }: { investor?: string }) => {
  const account = useCurrentAccount();
  const [types, setTypes] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("time");
  const [searchText, setSearchText] = useState<string>("");

  const onSearch = throttle((e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, 500);

  const { push } = useRouter();

  const {
    data: pools,
    isPending,
    isLoading,
    refetch,
    isSuccess,
  } = useGetPools({
    types,
    order,
    orderBy,
    searchText,
    investor,
  });

  return (
    <div className="flex h-full w-full flex-col gap-2 md:gap-4">
      <div className="mt-4 flex flex-col-reverse flex-wrap items-end justify-between md:flex-row md:items-center">
        <div className="flex flex-wrap gap-1 md:gap-4">
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
        <div className="flex flex-wrap items-center gap-2">
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
          <button
            className="btn btn-ghost btn-sm px-2"
            onClick={() => {
              setOrder(order === "asc" ? "desc" : "asc");
            }}
          >
            {order === "asc" ? <IconSortDownAlt /> : <IconSortDown />}
          </button>
          <SelectMenu
            options={orderOptions.map((order) => ({
              value: order,
              key: order,
            }))}
            value={{
              key: orderBy,
              value: orderBy,
            }}
            onSelect={(value: { key: string; value: string }) => {
              setOrderBy(value.value);
            }}
            dropdownEnd={false}
          />
          <button
            className="btn btn-ghost"
            onClick={() => {
              setTypes([]);
              setSearchText("");
              document.querySelectorAll('input[name="type"]').forEach((el) => {
                (el as HTMLInputElement).checked = false;
              });
              (
                document.querySelector('input[type="text"]') as HTMLInputElement
              ).value = "";
            }}
          >
            clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isPending &&
          !isLoading &&
          Array.from(Array(3)).map((_, i) => (
            <div key={i} className="skeleton h-[60px] w-full rounded-md" />
          ))}
        {pools?.map((pool) => {
          const funded = Number(
            (
              (Number(pool?.totalFunded) / Number(pool?.limit_amount)) *
              100
            ).toFixed(2),
          );

          const holded = pool?.fund_history
            ?.filter((history) => history.investor === account?.address)
            ?.reduce((acc, cur) => {
              if (cur.action === "Invested") {
                return acc + cur.amount;
              } else {
                return acc - cur.amount;
              }
            }, 0);
          return (
            <div
              key={pool.object_id}
              className={`collapse collapse-arrow rounded-md ${primaryGradient} `}
            >
              <input type="checkbox" name="pool" />
              <div className="collapse-title flex items-center px-4 md:px-6">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="tooltip" data-tip={pool.name}>
                      <div className="text-md max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-[200px] md:text-xl">
                        {pool.name}
                      </div>
                    </div>
                    <div className="flex gap-1 md:gap-2">
                      {pool?.types?.map((type) => (
                        <Tag key={type} text={type} />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pr-8 md:gap-4">
                    <div className="hidden md:block">
                      <TraderInfo address={pool.owner_id} />
                    </div>
                    {investor ? (
                      <div className="hidden items-center text-lg md:block">
                        {Number(
                          (
                            (Number(holded) / Number(pool?.totalFunded)) *
                            100
                          ).toFixed(2),
                        )}
                        % Holded
                      </div>
                    ) : (
                      <div className="hidden items-center text-lg md:block">
                        {funded}% Funded
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="collapse-content px-0">
                <FundInfo
                  investor={investor}
                  pool={pool}
                  onSuccess={() => {
                    refetch();
                  }}
                />
              </div>
            </div>
          );
        })}
        {pools?.length === 0 && isSuccess && (
          <div className="mt-24 flex flex-col items-center gap-4">
            <button
              className="btn btn-primary"
              onClick={() => {
                push("/stingray-pools");
              }}
            >
              Go to invest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolListTemplate;
