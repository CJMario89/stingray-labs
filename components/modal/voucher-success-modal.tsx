import { secondaryGradient } from "@/app/stingray-pools/page";

const VoucherSuccessModal = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <dialog id="voucher-success-modal" className="modal">
      <div className={`${secondaryGradient} modal-box flex flex-col gap-4`}>
        <h2 className="mb-4 text-2xl font-bold">Claim Successful</h2>
        <div className="modal-action">
          <div className="flex items-center gap-4">
            <form method="dialog">
              <button className={`btn btn-ghost`}>desposit later</button>
            </form>
            <button
              className={`btn btn-primary`}
              onClick={() => {
                onSuccess();
              }}
            >
              Go Deposit
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default VoucherSuccessModal;
