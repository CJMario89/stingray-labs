import { syncDb } from "@/common/sync-db";
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
import toast from "react-hot-toast";

type UseAddFundProps = UseMutationOptions<
  void,
  Error,
  {
    amount: number;
    shares: string[];
  }
> & {
  fundId: string;
};

const useRemoveFund = (options?: UseAddFundProps) => {
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
      amount,
      shares,
    }: {
      amount: number;
      shares: string[];
    }) => {
      if (!account) {
        throw new Error("Account not found");
      }

      console.log(shares);
      if (!shares.length) {
        throw new Error("Share not found");
      }

      if (
        !process.env.NEXT_PUBLIC_GLOBAL_CONFIG ||
        !process.env.NEXT_PUBLIC_PACKAGE ||
        !process.env.NEXT_PUBLIC_FUND_BASE
      ) {
        throw new Error("Global config or package not found");
      }

      const fundId = options?.fundId;
      if (!fundId) {
        throw new Error("Fund id not found");
      }

      const tx = new Transaction();

      tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund",
        function: "deinvest",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG), //global config
          tx.object(fundId), //fund id
          tx.makeMoveVec({
            elements: shares.map((share) => tx.object(share)),
          }), //shares
          tx.pure.u64(
            amount * 10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL),
          ), //amount
          tx.object("0x6"),
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
      }); //fund

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      await syncDb.deinvest();

      console.log(result);
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (_data, _variables, _context) => {
      options?.onSuccess?.(_data, _variables, _context);
      await client.invalidateQueries({
        queryKey: ["pool-balance", options?.fundId],
        type: "all",
      });
      await client.invalidateQueries({
        queryKey: ["pools"],
        type: "all",
      });
      toast.success("Fund removed successfully");
    },
  });
};

export default useRemoveFund;
