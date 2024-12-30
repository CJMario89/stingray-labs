"use client";
import Image from "next/image";
import template from "@/public/images/stingray_element_1.png";
import useGetSponsorPools from "@/application/query/use-get-sponsor-pools";
import VoucherSuccessModal from "@/components/modal/voucher-success-modal";
import VoucherDepositModal from "@/components/modal/voucher-deposit-modal";
import { SuiObjectResponse } from "@mysten/sui/client";
import { primaryGradient } from "../stingray-pools/page";

const SponsorPool = ({ pool }: { pool: SuiObjectResponse }) => {
  console.log(pool);
  return (
    <div className={`flex flex-col gap-2 p-4 ${primaryGradient} items-center`}>
      <Image alt="" src={template} width={150} height={150} />
      <div className="text-lg font-semibold">Stingray Pool</div>
      <div className="text-sm text-neutral-400">Total Value Locked</div>
      <button
        className="btn btn-primary"
        onClick={() => {
          (
            document.getElementById(
              "voucher-success-modal",
            ) as HTMLDialogElement
          )?.showModal();
        }}
      >
        Claim
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
        pool={pool}
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
  const { data: sponsorPools } = useGetSponsorPools();
  console.log(sponsorPools);
  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center">
          <div className="text-2xl font-semibold">Fund Manager Sponsor</div>
          <div className="divider" />
        </div>
        <div className="grid grid-cols-3 gap-8">
          {sponsorPools?.map((pool) => (
            <SponsorPool key={pool.data?.objectId} pool={pool} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
