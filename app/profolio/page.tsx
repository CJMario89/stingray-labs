"use client";
import PoolListTemplate from "@/components/pool-list-template";
import { useCurrentAccount } from "@mysten/dapp-kit";

const Page = () => {
  const account = useCurrentAccount();
  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full items-center gap-2">
          <div className="whitespace-nowrap text-2xl font-semibold">
            Funded History
          </div>
          <div className="divider w-full" />
        </div>
        <PoolListTemplate investor={account?.address ?? ""} />
        {!account && (
          <div className="mt-24 flex flex-col items-center gap-4">
            <div className="text-lg text-neutral-400">
              Connect your wallet to view your funded history
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
