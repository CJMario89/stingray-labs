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
import useGetCoins from "./use-get-coins";
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
  const client = useQueryClient();

  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });
  const { mutateAsync: getCoins } = useGetCoins();
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
        !process.env.NEXT_PUBLIC_PACKAGE ||
        !process.env.NEXT_PUBLIC_FUND_BASE
      ) {
        throw new Error("Global config or package not found");
      }

      const tx = new Transaction();

      const coinAmount =
        amount * 10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL);

      const coinId = await getCoins({
        tx,
        owner: account.address,
        coinType: process.env.NEXT_PUBLIC_FUND_BASE,
        amount: coinAmount,
      });

      const mintRequest = tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund",
        function: "invest_with_asset",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG), //global config
          tx.object(fundId), //fund id
          coinId,
          tx.object("0x6"),
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
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
    onSuccess: async (_data, _variables, _context) => {
      options?.onSuccess?.(_data, _variables, _context);
      toast.success("Fund added successfully");
      await client.invalidateQueries({
        queryKey: ["pools"],
      });
    },
  });
};

export default useAddFund;
