import useAddFund from "@/application/mutation/use-add-fund";
import useGetBalance from "@/application/query/use-get-balance";
import { Fund } from "@/type";
import React, { useRef } from "react";
import { primaryGradient, secondaryGradient } from "../pool-list-template";
import toast from "react-hot-toast";
import { useCurrentAccount } from "@mysten/dapp-kit";

const AddFundModal = ({
  pool,
  onSuccess,
}: {
  pool: Fund;
  onSuccess: () => void;
}) => {
  const { data: balance } = useGetBalance({
    coinType: process.env.NEXT_PUBLIC_FUND_BASE,
  });
  const { mutate: add, isPending: isAdding } = useAddFund({
    fundId: pool.object_id,
    onSuccess: () => {
      onSuccess();
    },
  });
  const account = useCurrentAccount();
  const amountRef = useRef<HTMLInputElement>(null);
  return (
    <dialog id="add-fund-modal" className="modal">
      <div className={`${secondaryGradient} modal-box flex flex-col gap-4`}>
        <h3 className="text-lg font-bold">Deposit</h3>
        <label className="input flex items-center gap-2 rounded-md">
          <input
            ref={amountRef}
            type="number"
            className="grow"
            placeholder="Amount"
          />
        </label>
        <div className="text-sm text-neutral-400">Balance: {balance} USDC</div>
        <div className="modal-action">
          <div className="flex gap-4">
            <button
              className={`btn btn-primary`}
              onClick={() => {
                if (!amountRef.current) {
                  return;
                }
                if (!account) {
                  toast.error("Please connect your wallet");
                  return;
                }
                add({
                  amount: Number(amountRef.current.value),
                });
              }}
            >
              {isAdding ? (
                <span className="loading loading-spinner"></span>
              ) : (
                ""
              )}
              Add
            </button>
            <form method="dialog">
              <button className={`btn ${primaryGradient}`}>Close</button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default AddFundModal;
