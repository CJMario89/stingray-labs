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
import { scallopDeposit } from "@/application/ptb-operation/scallop-deposit";

type UseScallopDespositProps = UseMutationOptions<
  void,
  Error,
  {
    name: string;
    fundId: string;
    amount: string;
  }
> & {
  fundId?: string;
};

const useScallopDeposit = (options?: UseScallopDespositProps) => {
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
      amount,
    }: {
      name: string;
      fundId: string;
      amount: string;
    }) => {
      const tx = new Transaction();

      scallopDeposit({
        tx,
        name,
        fundId,
        cap,
        amount,
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      console.log(result);
      await syncDb.deposit("Scallop");
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
        type: "all",
      });
      refetchBalance();
    },
  });
};

export default useScallopDeposit;
