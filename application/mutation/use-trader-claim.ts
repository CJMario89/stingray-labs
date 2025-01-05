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
import toast from "react-hot-toast";
import useGetPoolCap from "../query/pool/use-get-pool-cap";

type UseTraderClaimProps = UseMutationOptions<void, Error, void> & {
  fundId?: string;
};

const useTraderClaim = (options?: UseTraderClaimProps) => {
  const client = useQueryClient();
  const account = useCurrentAccount();
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
      if (!cap) {
        throw new Error("Cap not found");
      }
      if (!fundId) {
        throw new Error("Fund id not found");
      }
      if (
        !process.env.NEXT_PUBLIC_GLOBAL_CONFIG ||
        !process.env.NEXT_PUBLIC_PACKAGE ||
        !process.env.NEXT_PUBLIC_FUND_BASE
      ) {
        throw new Error("Global config or package not found");
      }

      if (!account) {
        throw new Error("Account not found");
      }

      const tx = new Transaction();
      const coin = tx.moveCall({
        package: process.env.NEXT_PUBLIC_PACKAGE,
        module: "fund",
        function: "trader_claim",
        arguments: [
          tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG),
          tx.object(cap),
          tx.object(fundId),
        ],
        typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
      });

      tx.transferObjects([coin], account.address);
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      console.log(result);
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (_data, _variables, _context) => {
      options?.onSuccess?.(_data, _variables, _context);
      toast.success("Claim successfully");

      await client.invalidateQueries({
        queryKey: ["pools"],
        type: "all",
      });
    },
  });
};

export default useTraderClaim;
