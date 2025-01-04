import { syncDb } from "@/common/sync-db";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import useGetPoolBalance from "@/application/query/pool/use-get-pool-balance";
import useGetPoolCap from "@/application/query/pool/use-get-pool-cap";
import toast from "react-hot-toast";
import { suilendWithdraw } from "@/application/ptb-operation/suilend-withdraw";

type UseSuilendWithdrawProps = UseMutationOptions<
  void,
  Error,
  {
    liquidityAmount: number;
    name: string;
    fundId: string;
    reStakeAmount: number;
  }
> & {
  fundId?: string;
};

const useSuilendWithdraw = (options?: UseSuilendWithdrawProps) => {
  const client = useQueryClient();
  const { refetch: refetchBalance } = useGetPoolBalance({
    fundId: options?.fundId,
  });
  const { data: cap } = useGetPoolCap({
    fundId: options?.fundId,
  });
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });
  return useMutation({
    mutationFn: async ({
      liquidityAmount,
      name,
      fundId,
      reStakeAmount,
    }: {
      liquidityAmount: number;
      name: string;
      fundId: string;
      reStakeAmount: number;
    }) => {
      const tx = new Transaction();
      const { tx: transaction } = suilendWithdraw({
        tx,
        liquidityAmount,
        name,
        fundId,
        cap,
        reStakeAmount,
      });

      const result = await signAndExecuteTransaction({
        transaction,
      });
      console.log(result);
      await syncDb.withdraw("Suilend");
      await syncDb.deposit("Suilend");
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (_data, _variables, _context) => {
      options?.onSuccess?.(_data, _variables, _context);
      toast.success("Withdraw success");
      await client.invalidateQueries({
        queryKey: ["pools"],
        type: "all",
      });
      refetchBalance();
    },
  });
};

export default useSuilendWithdraw;