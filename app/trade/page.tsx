"use client";
import useSettle from "@/application/mutation/use-settle";
import useTradeBackToUsdc from "@/application/mutation/use-trade-back-to-usdc";
import useTraderClaim from "@/application/mutation/use-trader-claim";
import useGetPoolPriceHistory from "@/application/query/pool/use-get-pool-price-history";
import useGetPools from "@/application/query/use-get-pools";
import Chart from "@/components/chart";
import Tag from "@/components/common/tag";
import SelectMenu from "@/components/select-menu";
import Farm from "@/components/trade/farm";
import Swap from "@/components/trade/swap";
import { Fund } from "@/type";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

const Page = () => {
  const account = useCurrentAccount();
  const {
    data: pools,
    isSuccess,
    isPending,
  } = useGetPools({
    owner: account?.address,
    types: ["trading", "ended"],
  });

  const [selected, setSelected] = useState<Fund>();

  const { mutate: tradeBack, isPending: isTradeBacking } = useTradeBackToUsdc({
    fundId: selected?.object_id,
  });

  const { mutate: settle, isPending: isSettling } = useSettle({
    fundId: selected?.object_id,
  });

  const { mutate: traderClaim, isPending: isTraderClaiming } = useTraderClaim({
    fundId: selected?.object_id,
  });

  useEffect(() => {
    if (!account) {
      return;
    }
    if (!isSuccess) {
      return;
    }
    if (pools.length === 0) {
      setSelected(undefined);
      return;
    }
    setSelected(pools[0]);
  }, [account, isSuccess, pools]);

  const noPools = !isPending && pools?.length === 0;

  const { data: histories } = useGetPoolPriceHistory({
    fundId: selected?.object_id,
  });

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-semibold">Trade</div>
        <div className="w-[fit-content]">
          {noPools ? (
            <div className="text-neutral-400">No running pools found</div>
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
                onSelect={(pool) =>
                  setSelected(pools?.find((p) => p.object_id === pool.value))
                }
              />
              <div className="flex gap-2">
                {selected?.types?.map((type) => <Tag key={type} text={type} />)}
              </div>
            </div>
          ) : (
            <div className="skeleton h-8 w-32" />
          )}
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <Swap fundId={selected?.object_id ?? ""} />
          <Farm fundId={selected?.object_id} />
        </div>
        {!noPools && !isPending && (
          <div className="flex gap-2">
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
              className="btn btn-primary"
            >
              {isTraderClaiming && <div className="loading loading-spinner" />}
              Claim Trader Fee
            </button>
          </div>
        )}
      </div>
      <Chart data={histories} />
    </div>
  );
};

export default Page;
