import { syncDb } from "@/common/sync-db";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import toast from "react-hot-toast";
// import useRefetchWholeFund from "./use-refetch-whole-fund";

type UseAddFundProps = UseMutationOptions<
  void,
  Error,
  {
    amount: number;
    fundId: string;
  }
>;

const useAddFund = (options?: UseAddFundProps) => {
  const account = useCurrentAccount();
  // const { refetch } = useRefetchWholeFund();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });
  return useMutation({
    mutationFn: async ({
      amount = 0.01,
      fundId,
    }: {
      amount: number;
      fundId: string;
    }) => {
      if (!account) {
        throw new Error("Account not found");
      }
      if (
        !process.env.NEXT_PUBLIC_GLOBAL_CONFIG ||
        !process.env.NEXT_PUBLIC_PACKAGE
      ) {
        throw new Error("Global config or package not found");
      }

      const tx = new Transaction();

      const mintRequest = tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund",
        function: "invest",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG), //global config
          tx.object(fundId), //fund id
          tx.splitCoins(tx.gas, [amount * 10 ** 9]), // coin // temporary sui only
          tx.object("0x6"),
        ],
        typeArguments: ["0x2::sui::SUI"],
      }); //fund

      // mint share
      const share = tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund_share",
        function: "mint",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG), //global config
          mintRequest, //mint request
        ],
        typeArguments: ["0x2::sui::SUI"],
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
    onSuccess: async (_data, _variables, _context) => {
      options?.onSuccess?.(_data, _variables, _context);
      // refetch();
      toast.success("Fund added successfully");
    },
  });
};

export default useAddFund;
