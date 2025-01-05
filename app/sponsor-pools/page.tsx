"use client";
import Image from "next/image";
import template from "@/public/images/stingray_element_2.png";
import useGetSponsorPools from "@/application/query/use-get-sponsor-pools";
import type { SponsorPool } from "@/application/query/use-get-sponsor-pools";
import VoucherSuccessModal from "@/components/modal/voucher-success-modal";
import VoucherDepositModal from "@/components/modal/voucher-deposit-modal";
import useClaimVoucher from "@/application/mutation/use-claim-voucher";
import useGetOwnedVouchers from "@/application/query/use-get-owned-vouchers";
import { formatBasePrice } from "@/common";
import { primaryGradient } from "@/components/pool-list-template";
import { useState } from "react";
import TraderInfo from "@/common/trader-info";
import useGetMintedVouchers from "@/application/query/use-get-minted-vouchers";

const SponsorPool = ({
  pool,
  onSelect,
}: {
  pool: SponsorPool;
  onSelect: (sponsorPool: SponsorPool) => void;
}) => {
  const {
    data: vouchers,
    isPending: isGettingVoucher,
    refetch,
  } = useGetOwnedVouchers({
    sponsor: pool.sponsor,
  });
  const { mutate: claim, isPending: isClaiming } = useClaimVoucher({
    sponsor: pool.sponsor,
    onSuccess: () => {
      (
        document.getElementById("voucher-success-modal") as HTMLDialogElement
      )?.showModal();
      refetch();
    },
  });
  const hasVoucher = vouchers && vouchers?.length > 0;

  const { data: mintedVouchers } = useGetMintedVouchers({
    sponsorPoolId: pool.sponsorPoolId,
  });

  const remainingTimes =
    Number(pool.totalTimes) - (mintedVouchers?.length ?? 0);
  const avaliableTimes =
    Number(pool.remainTimes) > remainingTimes
      ? remainingTimes
      : pool.remainTimes;

  return (
    <div
      className={`flex flex-col gap-4 p-4 ${primaryGradient} w-full items-start rounded-lg`}
    >
      <Image
        alt=""
        src={template}
        width={300}
        height={300}
        style={{
          width: "100%",
        }}
      />
      <div className="flex w-full flex-col gap-2">
        <div className="text-lg font-semibold">
          {<TraderInfo address={pool.sponsor} />}
        </div>
        <div className="text-sm text-neutral-400">
          Remaining: {formatBasePrice(Number(pool.remaining))} USDC
        </div>
        <div className="text-sm text-neutral-400">
          {formatBasePrice(Number(pool.amountPerVoucher))} USDC per voucher
        </div>
        <div className="text-sm text-neutral-400">
          {avaliableTimes} / {pool.totalTimes}
        </div>
      </div>
      <button
        disabled={isClaiming || !avaliableTimes}
        className="btn btn-outline w-full"
        onClick={() => {
          onSelect(pool);
          if (!pool.sponsorPoolId) {
            return;
          }
          claim({
            sponsorPoolId: pool.sponsorPoolId,
          });
        }}
      >
        {isClaiming && <span className="loading loading-spinner" />}
        Claim Voucher
      </button>
      <button
        disabled={!hasVoucher}
        className="btn btn-outline w-full"
        onClick={() => {
          onSelect(pool);
          if (hasVoucher) {
            (
              document.getElementById(
                "voucher-deposit-modal",
              ) as HTMLDialogElement
            )?.showModal();
            return;
          }
        }}
      >
        {isGettingVoucher && <span className="loading loading-spinner" />}
        Deposit
      </button>
    </div>
  );
};

const Page = () => {
  const { data: sponsorPools, isPending } = useGetSponsorPools();

  const [selectedPool, setSelectedPool] = useState(sponsorPools?.[0]);

  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full items-center gap-2">
          <div className="whitespace-nowrap text-2xl font-semibold">
            Fund Manager Sponsor
          </div>
          <div className="divider w-full" />
        </div>
        {!isPending && (
          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
            {sponsorPools?.map((pool) => {
              return (
                <SponsorPool
                  key={pool.sponsorPoolId}
                  pool={pool}
                  onSelect={(pool) => {
                    setSelectedPool(pool);
                  }}
                />
              );
            })}
          </div>
        )}
        {isPending && (
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            <div className="skeleton h-80 w-full"></div>
            <div className="skeleton h-80 w-full"></div>
            <div className="skeleton h-80 w-full"></div>
          </div>
        )}
      </div>
      <VoucherSuccessModal
        onSuccess={() => {
          (
            document.getElementById(
              "voucher-success-modal",
            ) as HTMLDialogElement
          )?.close();
          (
            document.getElementById(
              "voucher-deposit-modal",
            ) as HTMLDialogElement
          )?.showModal();
        }}
      />
      <VoucherDepositModal
        sponsorPool={selectedPool}
        onSuccess={() => {
          (
            document.getElementById(
              "voucher-deposit-modal",
            ) as HTMLDialogElement
          )?.close();
        }}
      />
    </div>
  );
};

export default Page;
