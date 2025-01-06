"use client";
import useSettle from "@/application/mutation/use-settle";
import useTradeBackToUsdc from "@/application/mutation/use-trade-back-to-usdc";
import useTraderClaim from "@/application/mutation/use-trader-claim";
import useGetPoolPriceHistory from "@/application/query/pool/use-get-pool-price-history";
import useGetPools from "@/application/query/use-get-pools";
import Chart from "@/components/chart";
import Tag from "@/components/common/tag";
import FundAssets from "@/components/fund/fund-assets";
import FundHistory from "@/components/fund/fund-history";
import SelectMenu from "@/components/select-menu";
import Farm from "@/components/trade/farm";
import Swap from "@/components/trade/swap";
import { useConnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const account = useCurrentAccount();
  const { status } = useConnectWallet();
  const { push } = useRouter();
  const {
    data: pools,
    isSuccess,
    isPending,
    refetch,
  } = useGetPools({
    owner: account?.address,
    types: ["trading", "ended"],
    enabled: Boolean(account),
  });

  const [selectedId, setSelectedId] = useState<string>();

  const selected = pools?.find((pool) => pool.object_id === selectedId);

  const { mutate: tradeBack, isPending: isTradeBacking } = useTradeBackToUsdc({
    fundId: selected?.object_id,
  });

  const { mutate: settle, isPending: isSettling } = useSettle({
    fundId: selected?.object_id,
  });

  const { mutate: traderClaim, isPending: isTraderClaiming } = useTraderClaim({
    fundId: selected?.object_id,
  });

  const hasSettled = selected?.types?.includes("settled");

  useEffect(() => {
    if (!account) {
      return;
    }
    if (!isSuccess) {
      return;
    }
    if (pools.length === 0) {
      setSelectedId(undefined);
      return;
    }
    if (
      !selected ||
      !pools.some((pool) => pool.object_id === selected.object_id)
    ) {
      setSelectedId(pools[0]?.object_id);
    }
  }, [account, isSuccess, pools, selected]);
  console.log(status);
  const noPools =
    (!Boolean(account) && status === "idle") ||
    (!isPending && pools?.length === 0);

  const { data: histories } = useGetPoolPriceHistory({
    fundId: selected?.object_id,
  });

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-semibold">Trade</div>
        <div className="w-[fit-content]">
          {noPools ? (
            <div className="flex flex-col gap-2">
              <div className="text-neutral-400">No running pools found</div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  push("/create-fund");
                }}
              >
                Create Fund
              </button>
            </div>
          ) : !isPending ? (
            <div className="flex items-center gap-2">
              <SelectMenu
                options={
                  pools?.map((pool) => ({
                    key: pool.name,
                    value: pool.object_id,
                  })) ?? []
                }
                value={{
                  key: selected?.name ?? "",
                  value: selected?.object_id ?? "",
                }}
                onSelect={(pool) => setSelectedId(pool.value as string)}
                dropdownEnd={false}
              />
              <div className="flex gap-2">
                {selected?.types?.map((type) => <Tag key={type} text={type} />)}
              </div>
            </div>
          ) : (
            <div className="skeleton h-8 w-32" />
          )}
        </div>

        {Boolean(selected) && (
          <div className="max-w-[670px] px-2">
            <Chart data={histories} id={selected?.object_id ?? ""} />
          </div>
        )}
        {Boolean(selected) && (
          <div
            className={`grid max-w-[670px] grid-cols-1 gap-4 rounded-md md:col-span-2 md:grid-cols-2`}
          >
            <div className={`flex max-w-[320px] flex-col gap-2`}>
              <div>Fund Assets</div>
              <FundAssets fund={selected} />
            </div>
            <div className={`flex max-w-[320px] flex-col gap-2`}>
              <div>Fund History</div>
              <FundHistory fund={selected} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row">
          <Swap
            fundId={selected?.object_id ?? ""}
            onSuccess={() => {
              refetch();
            }}
          />
          <Farm
            fundId={selected?.object_id}
            onSuccess={() => {
              refetch();
            }}
          />
        </div>
        {!noPools && !isPending && (
          <div className="flex flex-col gap-2 md:flex-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                tradeBack();
              }}
              disabled={isTradeBacking || selected?.types?.includes("settled")}
            >
              {isTradeBacking && <div className="loading loading-spinner" />}
              Trade Assets Back to USDC
            </button>
            <button
              onClick={() => {
                settle({
                  fundId: selected?.object_id,
                  initShareId: selected?.fund_history?.sort(
                    (a, b) => Number(a.timestamp) - Number(b.timestamp),
                  )[0].share_id,
                });
              }}
              className="btn btn-primary"
              disabled={isSettling || selected?.types?.includes("settled")}
            >
              {isSettling && <div className="loading loading-spinner" />}
              Settle
            </button>
            <button
              onClick={() => {
                traderClaim();
              }}
              className={`btn btn-primary ${hasSettled ? "" : "btn-disabled"}`}
            >
              {isTraderClaiming && <div className="loading loading-spinner" />}
              Claim Trader Fee
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
