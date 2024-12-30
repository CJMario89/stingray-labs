import { primaryGradient, secondaryGradient } from "@/app/stingray-pools/page";
import useRemoveFund from "@/application/mutation/use-remove-fund";
import useGetPoolShares from "@/application/query/pool/use-get-pool-shares";
import { Fund } from "@/type";
import React, { useRef } from "react";

const RemoveFundModal = ({
  pool,
  onSuccess,
}: {
  pool: Fund;
  onSuccess: () => void;
}) => {
  const { total, withdrawableShares } = useGetPoolShares({
    history: pool.fund_history,
  });

  const { mutate: remove, isPending: isRemoving } = useRemoveFund({
    onSuccess: () => {
      onSuccess();
    },
  });

  const amountRef = useRef<HTMLInputElement>(null);
  return (
    <dialog id="remove-fund-modal" className="modal">
      <div className={`${secondaryGradient} modal-box flex flex-col gap-4`}>
        <h3 className="text-lg font-bold">Withdraw</h3>
        <label className="input flex items-center gap-2 rounded-md">
          <input
            ref={amountRef}
            type="number"
            className="grow"
            placeholder="Amount"
          />
        </label>
        <div className="text-sm text-neutral-400">
          Deposit Balance: {total} USDC
        </div>
        <div className="modal-action">
          <div className="flex gap-4">
            <button
              className={`btn btn-primary`}
              onClick={() => {
                if (!amountRef.current || !pool.fund_history) {
                  return;
                }
                remove({
                  amount: Number(amountRef.current.value),
                  shares: withdrawableShares,
                  fundId: pool.object_id,
                });
              }}
            >
              {isRemoving ? (
                <span className="loading loading-spinner"></span>
              ) : (
                ""
              )}
              Remove
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

export default RemoveFundModal;
