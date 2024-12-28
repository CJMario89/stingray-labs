"use client";
import useGetPoolBalance from "@/application/query/pool/use-get-pool-balance";
import useGetPools from "@/application/query/use-get-pools";
import SelectMenu from "@/components/select-menu";
import Farm from "@/components/trade/farm";
import Swap from "@/components/trade/swap";
import { Fund } from "@/type";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

const Page = () => {
  const account = useCurrentAccount();
  const { data: pools, isSuccess } = useGetPools({
    owner: account?.address,
    types: ["trading"],
  });
  const [selected, setSelected] = useState<Fund>();

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

  const { data: poolBalance } = useGetPoolBalance({
    fundId: selected?.object_id,
  });
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-semibold">Trade</div>
        <div className="w-[fit-content]">
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
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <Swap
            fundId={selected?.object_id ?? ""}
            balance={poolBalance?.balances}
          />
          <Farm balance={poolBalance?.balances} />
        </div>
      </div>
    </div>
  );
};

export default Page;
