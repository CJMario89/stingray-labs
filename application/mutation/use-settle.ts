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
import { settle } from "../ptb-operation/settle";
import { syncDb } from "@/common/sync-db";
import useGetPoolBalance from "../query/pool/use-get-pool-balance";
import toast from "react-hot-toast";
import useGetPoolTokens from "../query/use-get-pool-tokens";

type UseSettleProps = UseMutationOptions<
  void,
  Error,
  {
    fundId?: string;
    initShareId?: string;
  }
> & {
  fundId?: string;
};

const useSettle = (options?: UseSettleProps) => {
  const account = useCurrentAccount();
  const { refetch: refetchBalance, data: fundBalance } = useGetPoolBalance({
    fundId: options?.fundId,
  });
  const { data: poolTokens } = useGetPoolTokens({
    fundId: options?.fundId,
  });
  const client = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });
  return useMutation({
    mutationFn: async ({
      fundId,
      initShareId,
    }: {
      fundId?: string;
      initShareId?: string;
    }) => {
      if (!fundBalance) {
        throw new Error("Fund balance not found");
      }
      if (!fundId) {
        throw new Error("Fund id not found");
      }
      if (!initShareId) {
        throw new Error("Initial Share id not found");
      }
      if (!poolTokens) {
        throw new Error("poolTokens not found");
      }
      if (!account) {
        throw new Error("Account not found");
      }
      const tx = new Transaction();

      settle({
        tx,
        poolTokens,
        address: account?.address,
        fundId,
        initShareId,
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      await syncDb.settle();
      console.log(result);
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (_data, _variables, _context) => {
      options?.onSuccess?.(_data, _variables, _context);
      toast.success("Settle successfully");
      refetchBalance();
      await client.invalidateQueries({
        queryKey: ["pools"],
      });
    },
  });
};

export default useSettle;
