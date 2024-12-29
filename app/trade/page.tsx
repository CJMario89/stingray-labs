"use client";
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

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-semibold">Trade</div>
        <div className="w-[fit-content]">
          {!isPending && pools?.length === 0 ? (
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
      </div>
    </div>
  );
};

export default Page;
