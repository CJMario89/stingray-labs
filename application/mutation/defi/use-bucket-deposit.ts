import { bucketDeposit } from "@/application/ptb-operation/bucket-deposit";
import useGetPoolBalance from "@/application/query/pool/use-get-pool-balance";
import useGetPoolCap from "@/application/query/pool/use-get-pool-cap";
import { syncDb } from "@/common/sync-db";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

type UseBucketDespositProps = UseMutationOptions<
  void,
  Error,
  {
    name: string;
    fundId: string;
    amount: string;
    hasDeposit?: boolean;
  }
> & {
  fundId?: string;
};

const useBucketDeposit = (options?: UseBucketDespositProps) => {
  const { refetch: refetchBalance } = useGetPoolBalance({
    fundId: options?.fundId,
  });
  const { data: cap } = useGetPoolCap({ fundId: options?.fundId });
  const client = useQueryClient();
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
      amount,
      hasDeposit,
      originalAmount,
    }: {
      name: string;
      fundId: string;
      amount: string;
      hasDeposit?: boolean;
      originalAmount?: number;
    }) => {
      const tx = new Transaction();

      bucketDeposit({
        tx,
        name,
        fundId,
        cap,
        amount,
        hasDeposit,
        originalAmount,
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
      toast.success("Deposit success");
      await client.invalidateQueries({
        queryKey: ["pools"],
      });
      refetchBalance();
    },
  });
};

export default useBucketDeposit;
