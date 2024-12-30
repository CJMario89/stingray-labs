import { primaryGradient, secondaryGradient } from "@/app/stingray-pools/page";

const VoucherSuccessModal = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <dialog id="voucher-success-modal" className="modal">
      <div className={`${secondaryGradient} modal-box flex flex-col gap-4`}>
        <div className="modal-action">
          <div className="flex gap-4">
            <button
              className={`btn btn-primary`}
              onClick={() => {
                onSuccess();
              }}
            >
              Go Deposit
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

export default VoucherSuccessModal;
