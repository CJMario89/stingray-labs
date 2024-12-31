import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { syncDb } from "@/common/sync-db";
import toast from "react-hot-toast";

type UseDepositVoucherProps = UseMutationOptions<
  void,
  Error,
  {
    sponsorPoolId: string;
    vouchers: string[];
    fundId: string;
  }
>;

const useDepositVoucher = (options?: UseDepositVoucherProps) => {
  const account = useCurrentAccount();
  const client = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });

  return useMutation({
    mutationFn: async ({
      sponsorPoolId,
      vouchers,
      fundId,
    }: {
      sponsorPoolId: string;
      vouchers: string[];
      fundId: string;
    }) => {
      if (!account) {
        throw new Error("Account not found");
      }
      if (
        !process.env.NEXT_PUBLIC_GLOBAL_CONFIG ||
        !process.env.NEXT_PUBLIC_PACKAGE ||
        !process.env.NEXT_PUBLIC_FUND_BASE
      ) {
        throw new Error("Global config or package not found");
      }

      const tx = new Transaction();
      console.log(
        `${process.env.NEXT_PUBLIC_PACKAGE_ASSET}::fund::VoucherConsumeRequest<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
      );
      const consumeResponse = tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "voucher",
        function: "consume",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG),
          tx.object(sponsorPoolId),
          tx.makeMoveVec({
            elements: vouchers.map((voucher) => tx.object(voucher)),
          }),
          tx.object("0x6"),
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
      });

      const mintRequest = tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund",
        function: "invest_with_voucher",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG),
          tx.makeMoveVec({
            type: `${process.env.NEXT_PUBLIC_PACKAGE_ASSET}::voucher::VoucherConsumeRequest<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
            // type: `${process.env.NEXT_PUBLIC_PACKAGE_ASSET}::fund::VoucherConsumeRequest<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
            elements: [consumeResponse[1]],
          }),
          tx.object(fundId),
          consumeResponse[0],
          tx.object("0x6"),
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
      });

      // mint share
      const share = tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund_share",
        function: "mint",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG), //global config
          mintRequest, //mint request
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
      });

      tx.transferObjects([share], account.address);

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      await syncDb.invest();

      console.log(result);
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (data, variable, context) => {
      await syncDb.sponsorPool();
      toast.success(
        "Congratulations! You have successfully deposit with voucher!",
      );
      await client.invalidateQueries({
        queryKey: ["sponsor-pools"],
        type: "all",
      });
      options?.onSuccess?.(data, variable, context);
    },
  });
};

export default useDepositVoucher;
