import { primaryGradient, secondaryGradient } from "@/app/stingray-pools/page";
import useDepositVoucher from "@/application/mutation/use-deposit-voucher";
import useGetOwnedVouchers from "@/application/query/use-get-owned-vouchers";
import useGetPools from "@/application/query/use-get-pools";
import { SponsorPool } from "@/application/query/use-get-sponsor-pools";
import { formatBasePrice } from "@/common";
import { useState } from "react";

const VoucherDepositModal = ({
  onSuccess,
  sponsorPoolId,
  sponsor,
  amountPerVoucher,
}: SponsorPool & {
  onSuccess: () => void;
}) => {
  const [selectedPool, setSelectedPool] = useState<string>();

  const { data: pools } = useGetPools({
    types: ["funding"],
    owner: sponsor,
  });

  const { mutate: depositVoucher, isPending: isDepositingVoucher } =
    useDepositVoucher({
      fundId: pools?.find((pool) => pool.object_id === selectedPool)?.object_id,
      onSuccess: () => {
        onSuccess();
      },
    });

  const { data: vouchers, isPending: isGettingVoucher } = useGetOwnedVouchers({
    sponsor,
  });
  return (
    <dialog id="voucher-deposit-modal" className="modal">
      <div className={`${secondaryGradient} modal-box flex flex-col gap-4`}>
        <h2 className="mb-4 text-2xl font-bold">Deposit Voucher</h2>
        <div className="flex flex-col gap-4">
          {pools?.map((pool) => {
            return (
              <label
                key={pool.object_id}
                className={`flex flex-col p-4 ${primaryGradient} cursor-pointer rounded-lg ${
                  pool.object_id === selectedPool
                    ? "border border-neutral-400"
                    : ""
                } hover:brightness-[130%]`}
              >
                <input
                  type="radio"
                  name="pool"
                  className="hidden"
                  value={pool.object_id}
                  onClick={() => {
                    setSelectedPool(pool.object_id);
                  }}
                />
                {pool.name}
              </label>
            );
          })}
        </div>
        <div className="divider" />
        <div className="flex justify-between gap-2">
          <label className="input flex items-center gap-2">
            <input
              className="input"
              type="text"
              value={formatBasePrice(Number(amountPerVoucher))}
              disabled
            />
            <span>USDC</span>
          </label>
          <label className="input flex items-center gap-2">
            <input
              className="w-[50px]"
              type="number"
              max={vouchers?.length}
              defaultValue={1}
            />
          </label>
        </div>
        <div className="modal-action">
          <div className="flex gap-4">
            <button
              disabled={!selectedPool || isGettingVoucher}
              className={`btn btn-primary`}
              onClick={() => {
                if (!selectedPool || !sponsorPoolId) {
                  return;
                }

                depositVoucher({
                  sponsorPoolId,
                  vouchers: vouchers?.map((voucher) => voucher.id) ?? [],
                });
              }}
            >
              {isGettingVoucher ||
                (isDepositingVoucher && (
                  <span className="loading loading-spinner" />
                ))}
              Deposit
            </button>
            <form method="dialog">
              <button
                className={`btn ${primaryGradient}`}
                onClick={() => {
                  setSelectedPool(undefined);
                }}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default VoucherDepositModal;
