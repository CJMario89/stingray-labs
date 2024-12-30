"use client";
import useSettle from "@/application/mutation/use-settle";
import useTradeBackToUsdc from "@/application/mutation/use-trade-back-to-usdc";
import useGetPools from "@/application/query/use-get-pools";
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
    types: ["trading"],
  });
  const [selected, setSelected] = useState<Fund>();

  const { mutate: tradeBack, isPending: isTradeBacking } = useTradeBackToUsdc({
    fundId: selected?.object_id,
  });

  const { mutate: settle, isPending: isSettling } = useSettle({
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
      return;
    }
    setSelected(pools[0]);
  }, [account, isSuccess, pools]);

  const noPools = !isPending && pools?.length === 0;

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-semibold">Trade</div>
        <div className="w-[fit-content]">
          {noPools ? (
            <div className="text-neutral-400">No running pools found</div>
          ) : (
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
          )}
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <Swap fundId={selected?.object_id ?? ""} />
          <Farm fundId={selected?.object_id} />
        </div>
        {!noPools && (
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                tradeBack();
              }}
            >
              {isTradeBacking && <div className="loading loading-spinner" />}
              Trade Back to USDC
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
            >
              {isSettling && <div className="loading loading-spinner" />}
              Settle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
