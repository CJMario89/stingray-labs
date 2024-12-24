"use client";
import Farm from "@/components/trade/farm";
import Swap from "@/components/trade/swap";

const Page = () => {
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-2xl font-semibold">Trade</div>
        <div className="flex flex-col gap-4 md:flex-row">
          <Swap />
          <Farm />
        </div>
      </div>
    </div>
  );
};

export default Page;
