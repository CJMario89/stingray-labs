import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { syncDb } from "@/common/sync-db";
import useGetPoolBalance from "@/application/query/pool/use-get-pool-balance";
import { bucketWithdraw } from "@/application/ptb-operation/bucket-withdraw";
import toast from "react-hot-toast";
import useGetPoolCap from "@/application/query/pool/use-get-pool-cap";

type UseBucketWithdrawProps = UseMutationOptions<
  void,
  Error,
  {
    name: string;
    fundId: string;
    reStakeAmount: number;
  }
> & {
  fundId?: string;
};

const useBucketWithdraw = (options?: UseBucketWithdrawProps) => {
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
      name,
      fundId,
      reStakeAmount,
    }: {
      name: string;
      fundId: string;
      reStakeAmount: number;
    }) => {
      const tx = new Transaction();

      bucketWithdraw({
        tx,
        name,
        fundId,
        cap,
        reStakeAmount,
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      console.log(result);
      await syncDb.withdraw("Bucket");
      await syncDb.deposit("Bucket");
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (_data, _variables, _context) => {
      options?.onSuccess?.(_data, _variables, _context);
      toast.success("Withdraw successful");
      await client.invalidateQueries({
        queryKey: ["pools"],
      });
      refetchBalance();
    },
  });
};

export default useBucketWithdraw;
