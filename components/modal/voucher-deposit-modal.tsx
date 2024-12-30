import { primaryGradient, secondaryGradient } from "@/app/stingray-pools/page";
import useGetPools from "@/application/query/use-get-pools";
import { SuiObjectResponse } from "@mysten/sui/client";
import { useState } from "react";

const VoucherDepositModal = ({
  onSuccess,
  pool,
}: {
  onSuccess: () => void;
  pool: SuiObjectResponse;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = pool.data?.content as any;
  const poolOwner = content?.fields?.sponsor_addr;
  const { data: pools } = useGetPools({
    types: ["funding"],
    owner: poolOwner,
  });
  console.log(pools);
  const [selectedPool, setSelectedPool] = useState("");
  return (
    <dialog id="voucher-deposit-modal" className="modal">
      <div className={`${secondaryGradient} modal-box flex flex-col gap-4`}>
        <div className="flex flex-col gap-4">
          {pools?.map((pool) => {
            return (
              <label
                key={pool.object_id}
                className={`flex flex-col p-4 ${primaryGradient} cursor-pointer ${
                  pool.object_id === selectedPool
                    ? "border border-neutral-50"
                    : ""
                }`}
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
        <div className="modal-action">
          <div className="flex gap-4">
            <button className={`btn btn-primary`} onClick={() => {}}>
              Deposit
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

export default VoucherDepositModal;
