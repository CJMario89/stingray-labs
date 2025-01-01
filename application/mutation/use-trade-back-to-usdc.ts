import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { syncDb } from "@/common/sync-db";
import { settleBackToUsdc } from "../ptb-operation/settle-back-sui";
import useGetPoolBalance from "../query/pool/use-get-pool-balance";
import toast from "react-hot-toast";
import useGetPoolCap from "../query/pool/use-get-pool-cap";

type UseTradeBackToUsdcProps = UseMutationOptions<void, Error, void> & {
  fundId?: string;
};

const useTradeBackToUsdc = (options?: UseTradeBackToUsdcProps) => {
  const { data: fundBalance } = useGetPoolBalance({
    fundId: options?.fundId,
  });
  const client = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });

  const fundId = options?.fundId;
  const { data: cap } = useGetPoolCap({
    fundId: options?.fundId,
  });
  return useMutation({
    mutationFn: async () => {
      console.log(fundBalance);

      if (!fundBalance) {
        throw new Error("Fund balance not found");
      }
      if (!fundId) {
        throw new Error("Fund id not found");
      }

      const tx = new Transaction();
      settleBackToUsdc({
        tx,
        fundBalance: fundBalance.balances,
        fundId,
        cap,
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      console.log(result);
      await syncDb.withdraw("Scallop");
      await syncDb.withdraw("Suilend");
      await syncDb.withdraw("Bucket");
      await syncDb.swap();
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (_data, _variables, _context) => {
      options?.onSuccess?.(_data, _variables, _context);
      toast.success("All trade back to SUI successfully");

      await client.invalidateQueries({
        queryKey: ["pools"],
        type: "all",
      });
    },
  });
};

export default useTradeBackToUsdc;
