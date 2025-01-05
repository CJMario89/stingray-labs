import { syncDb } from "@/common/sync-db";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import useGetPoolBalance from "../../query/pool/use-get-pool-balance";
import toast from "react-hot-toast";
import { swap } from "../../ptb-operation/swap";

type UseCetusSwapProps = UseMutationOptions<
  void,
  Error,
  {
    cap?: string;
    fundId: string;
    inToken: string;
    inAmount: string;
    outToken: string;
  }
> & { fundId?: string };

const useCetusSwap = (options?: UseCetusSwapProps) => {
  const { refetch: refetchBalance } = useGetPoolBalance({
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
      cap,
      inToken,
      inAmount,
      outToken,
    }: // outAmount,
    {
      cap?: string;
      fundId: string;
      inToken: string;
      inAmount: string;
      outToken: string;
      // outAmount: string;
    }) => {
      const tx = new Transaction();

      const { tx: transaction } = swap({
        tx,
        fundId,
        cap,
        inToken,
        inAmount,
        outToken,
      });

      const result = await signAndExecuteTransaction({
        transaction,
      });
      console.log(result);
      await syncDb.swap();

      return;
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (_data, _variables, _context) => {
      toast.success("Swap success");
      refetchBalance();
      await client.invalidateQueries({
        queryKey: ["poos"],
        type: "all",
      });
      options?.onSuccess?.(_data, _variables, _context);
    },
  });
};

export default useCetusSwap;
