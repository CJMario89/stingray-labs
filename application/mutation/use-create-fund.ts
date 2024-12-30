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

type UseCreateFundProps = UseMutationOptions<
  void,
  Error,
  {
    name?: string;
    description?: string;
    traderFee: number;
    limitAmount: number;
    initialAmount: number;
    fundingStartTime: number;
    fundingEndTime: number;
    tradingEndTime: number;
    expectedRoi: number;
  }
>;

const useCreateFund = (options?: UseCreateFundProps) => {
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
      name = "",
      description = "",
      traderFee = 20,
      limitAmount = 1,
      initialAmount = 0.01,
      fundingStartTime,
      fundingEndTime,
      tradingEndTime,
      expectedRoi,
    }: {
      name: string;
      description: string;
      traderFee: number;
      limitAmount: number;
      initialAmount: number;
      fundingStartTime: number;
      fundingEndTime: number;
      tradingEndTime: number;
      expectedRoi: number;
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

      // console.log(process.env.NEXT_PUBLIC_GLOBAL_CONFIG);
      // console.log(name, "name");
      // console.log(description, "description");
      // console.log(traderFee, "traderFee");
      // console.log(limitAmount, "limitAmount");
      // console.log(initialAmount, "initialAmount");
      // console.log(
      //   new Date(fundingEndTime).getTime() -
      //     new Date(fundingStartTime).getTime(),
      //   "fundingStartTime",
      // );
      // console.log(fundingEndTime, "fundingEndTime");
      // console.log(tradingEndTime, "tradingEndTime");
      // console.log(expectedRoi, "expectedRoi");

      const coinAmount =
        initialAmount * 10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL);

      console.log(process.env.NEXT_PUBLIC_FUND_BASE);
      const fund = tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund",
        function: "create",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG), //global config
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.string(""), // image
          tx.pure.u64(traderFee * 100), // trader fee
          tx.pure.bool(false), // is arena
          tx.pure.u64(new Date(fundingStartTime).getTime()), //start time
          tx.pure.u64(
            new Date(fundingEndTime).getTime() -
              new Date(fundingStartTime).getTime(),
          ), //invest duration
          // tx.pure.u64(endTime + 1000 * 60 * 60 * 12), // end time
          tx.pure.u64(new Date(tradingEndTime).getTime()), // end time
          tx.pure.u64(
            limitAmount *
              10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL),
          ), // limit amount
          tx.pure.u64(expectedRoi * 100), // roi
          await getCoins({
            tx,
            coinType: process.env.NEXT_PUBLIC_FUND_BASE,
            amount: coinAmount,
            owner: account.address,
          }), // coin
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
      }); //fund

      // fund to share object
      tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund",
        function: "to_share_object",
        arguments: [
          fund[0], //fund
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
          fund[1], //mint request
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
      });

      tx.transferObjects([share], account.address);
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

export default useCreateFund;
