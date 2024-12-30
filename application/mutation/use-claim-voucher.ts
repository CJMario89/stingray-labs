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
import useGetCoins from "./use-get-coins";

type UseClaimVoucherProps = UseMutationOptions<
  void,
  Error,
  {
    sponsorPoolId: string;
  }
>;

const useClaimVoucher = (options?: UseClaimVoucherProps) => {
  const account = useCurrentAccount();
  const client = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });

  const { mutateAsync: getCoins } = useGetCoins();
  return useMutation({
    mutationFn: async ({ sponsorPoolId }: { sponsorPoolId: string }) => {
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

      tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "voucher",
        function: "mint_fund_manager_voucher",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG),
          tx.object(sponsorPoolId),
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      console.log(result);
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (data, variable, context) => {
      try {
        await syncDb.fund();
        await syncDb.invest();
      } catch {
        await syncDb.fund();
        await syncDb.invest();
      }
      toast.success("Congratulations! You have successfully created a fund!");
      await client.invalidateQueries({
        queryKey: ["pools"],
      });
      options?.onSuccess?.(data, variable, context);
    },
  });
};

export default useClaimVoucher;
