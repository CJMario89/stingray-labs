"use client";
import Image from "next/image";
import template from "@/public/images/stingray_element_1.png";
import useGetSponsorPools from "@/application/query/use-get-sponsor-pools";
import type { SponsorPool } from "@/application/query/use-get-sponsor-pools";
import VoucherSuccessModal from "@/components/modal/voucher-success-modal";
import VoucherDepositModal from "@/components/modal/voucher-deposit-modal";
import useClaimVoucher from "@/application/mutation/use-claim-voucher";
import useGetOwnedVouchers from "@/application/query/use-get-owned-vouchers";
import { formatBasePrice } from "@/common";
import { primaryGradient } from "@/components/pool-list-template";

const SponsorPool = (pool: SponsorPool) => {
  const { data: vouchers, isPending: isGettingVoucher } = useGetOwnedVouchers({
    sponsor: pool.sponsor,
  });
  const { mutate: claim, isPending: isClaiming } = useClaimVoucher({
    onSuccess: () => {
      (
        document.getElementById("voucher-success-modal") as HTMLDialogElement
      )?.showModal();
    },
  });
  const hasVoucher = vouchers && vouchers?.length > 0;
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
        <div className="text-lg font-semibold">Stingray Pool</div>
        <div className="text-sm text-neutral-400">Voucher Value</div>
        <div className="text-sm text-neutral-400">
          {formatBasePrice(Number(pool.amountPerVoucher))} USDC
        </div>
        <div className="text-sm text-neutral-400">
          {pool.remainTimes} / {pool.totalTimes}
        </div>
      </div>
      <button
        disabled={isClaiming || isGettingVoucher}
        className="btn btn-outline w-full"
        onClick={() => {
          if (hasVoucher) {
            (
              document.getElementById(
                "voucher-deposit-modal",
              ) as HTMLDialogElement
            )?.showModal();
            return;
          }
          if (!pool.sponsorPoolId) {
            return;
          }
          claim({
            sponsorPoolId: pool.sponsorPoolId,
          });
        }}
      >
        {(isClaiming || isGettingVoucher) && (
          <span className="loading loading-spinner" />
        )}
        {hasVoucher ? "Deposit" : "Claim"}
      </button>
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
        {...pool}
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

const Page = () => {
  const { data: sponsorPools, isPending } = useGetSponsorPools();

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
          <div className="grid w-full grid-cols-3 gap-8">
            {sponsorPools?.map((pool) => {
              return <SponsorPool key={pool.sponsorPoolId} {...pool} />;
            })}
          </div>
        )}
        {isPending && (
          <div className="grid w-full grid-cols-3 gap-4">
            <div className="skeleton h-80 w-full"></div>
            <div className="skeleton h-80 w-full"></div>
            <div className="skeleton h-80 w-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
