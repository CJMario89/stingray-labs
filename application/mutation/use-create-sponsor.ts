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

type UseCreateSponsorProps = UseMutationOptions<
  void,
  Error,
  {
    numberOfVouchers: string;
    amountPerVoucher: string;
    expireTime: string;
  }
>;

const useCreateSponsor = (options?: UseCreateSponsorProps) => {
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
      numberOfVouchers,
      amountPerVoucher,
      expireTime,
    }: {
      numberOfVouchers: string;
      amountPerVoucher: string;
      expireTime: string;
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

      tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "voucher",
        function: "new_fund_manager_sponsor_pool",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG),
          tx.pure.u64(Number(numberOfVouchers)),
          tx.pure.u64(
            Number(amountPerVoucher) *
              10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL),
          ),
          tx.pure.u64(new Date(expireTime).getTime()),
          await getCoins({
            tx,
            owner: account.address,
            amount:
              Number(amountPerVoucher) *
              10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL) *
              Number(numberOfVouchers),
            coinType: process.env.NEXT_PUBLIC_FUND_BASE,
          }),
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
      await syncDb.sponsorPool();
      toast.success(
        "Congratulations! You have successfully created a sponsor pool!",
      );
      await client.invalidateQueries({
        queryKey: ["sponsor-pools"],
        type: "all",
      });
      options?.onSuccess?.(data, variable, context);
    },
  });
};

export default useCreateSponsor;
