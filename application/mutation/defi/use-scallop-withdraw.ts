import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { syncDb } from "@/common/sync-db";
import useGetPoolBalance from "@/application/query/pool/use-get-pool-balance";
import useGetPoolCap from "@/application/query/pool/use-get-pool-cap";
import toast from "react-hot-toast";
import { scallopWithdraw } from "@/application/ptb-operation/scallop-withdraw";

type UseScallopWithdrawProps = UseMutationOptions<
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

const useScallopWithdraw = (options?: UseScallopWithdrawProps) => {
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

      scallopWithdraw({
        tx,
        liquidityAmount,
        name,
        fundId,
        cap,
        reStakeAmount,
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      console.log(result);
      await syncDb.withdraw("Scallop");
      await syncDb.deposit("Scallop");
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (_data, _variables, _context) => {
      toast.success("Withdraw success");
      await client.invalidateQueries({
        queryKey: ["pools"],
        type: "all",
      });
      refetchBalance();
      options?.onSuccess?.(_data, _variables, _context);
    },
  });
};

export default useScallopWithdraw;
