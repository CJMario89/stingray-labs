import useDepositVoucher from "@/application/mutation/use-deposit-voucher";
import useGetOwnedVouchers from "@/application/query/use-get-owned-vouchers";
import useGetPools from "@/application/query/use-get-pools";
import { SponsorPool } from "@/application/query/use-get-sponsor-pools";
import { formatBasePrice } from "@/common";
import { useState } from "react";
import { primaryGradient, secondaryGradient } from "../pool-list-template";
import IconPlus from "../icons/plus";
import IconMinus from "../icons/minus";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";

const VoucherDepositModal = ({
  onSuccess,
  sponsorPool,
}: {
  sponsorPool?: SponsorPool;
  onSuccess: () => void;
}) => {
  const [selectedPool, setSelectedPool] = useState<string>();
  const [amount, setAmount] = useState(1);

  const sponsor = sponsorPool?.sponsor;
  const sponsorPoolId = sponsorPool?.sponsorPoolId;
  const amountPerVoucher = sponsorPool?.amountPerVoucher;

  const { data: pools } = useGetPools({
    types: ["funding"],
    owner: sponsor,
  });

  const { push } = useRouter();
  const account = useCurrentAccount();
  const { mutate: depositVoucher, isPending: isDepositingVoucher } =
    useDepositVoucher({
      fundId: pools?.find((pool) => pool.object_id === selectedPool)?.object_id,
      onSuccess: () => {
        onSuccess();
        push("/profolio");
      },
    });
  const { data: vouchers, isPending: isGettingVoucher } = useGetOwnedVouchers({
    sponsor,
  });
  return (
    <dialog id="voucher-deposit-modal" className="modal">
      <div className={`${secondaryGradient} modal-box flex flex-col gap-4`}>
        <h2 className="mb-4 text-2xl font-bold">Deposit Voucher</h2>
        <div>Select a pool to deposit voucher</div>
        <div className="flex flex-col gap-4">
          {pools?.length === 0 && (
            <div className="text-start text-neutral-400">
              No fund available now
            </div>
          )}
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
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <label className="flex items-center gap-2">
            <input
              className="input max-w-[120px] text-neutral-50"
              type="text"
              value={formatBasePrice(Number(amountPerVoucher))}
              readOnly
            />
            <span>USDC</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              className={`btn btn-ghost ${amount <= 0 ? "btn-disabled" : ""}`}
              onClick={() => {
                setAmount((prev) => prev - 1);
              }}
              disabled={amount <= 0}
            >
              <IconMinus />
            </button>
            <label className="input flex items-center">
              <input
                className="w-[30px]"
                type="number"
                max={vouchers?.length}
                min={0}
                value={amount}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                }}
              />
            </label>
            <button
              disabled={amount >= (vouchers?.length ?? 0)}
              className={`btn btn-ghost ${
                amount >= (vouchers?.length ?? 0) ? "btn-disabled" : ""
              }`}
              onClick={() => {
                setAmount((prev) => prev + 1);
              }}
            >
              <IconPlus />
            </button>
          </div>
        </div>
        <div className="text-right text-xs text-neutral-400">
          Avalaible : {vouchers?.length ?? 0} voucher(s)
        </div>
        <div className="modal-action">
          <div className="flex gap-4">
            <button
              disabled={!selectedPool || isGettingVoucher || amount <= 0}
              className={`btn btn-primary`}
              onClick={() => {
                if (!selectedPool || !sponsorPoolId) {
                  return;
                }
                if (!account) {
                  toast.error("Please connect your wallet");
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
