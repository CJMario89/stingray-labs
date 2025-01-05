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
import { Fund } from "@/type";
import { claim } from "../ptb-operation/claim";
import { syncDb } from "@/common/sync-db";
import toast from "react-hot-toast";

type UseAddFundProps = UseMutationOptions<
  void,
  Error,
  {
    fund?: Fund;
  }
>;

const useClaim = (options?: UseAddFundProps) => {
  const account = useCurrentAccount();
  const client = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });
  return useMutation({
    mutationFn: async ({ fund }: { fund: Fund }) => {
      if (!account) {
        throw new Error("Account not found");
      }

      const history = [...(fund.fund_history ?? [])].sort((a, b) => {
        return Number(a.timestamp) - Number(b.timestamp);
      });
      const shares =
        history
          ?.filter((history) => !history?.redeemed)
          ?.filter((history) => history.investor === account?.address)
          ?.map((history) => history) || [];

      console.log(shares);
      if (!shares.length) {
        throw new Error("Share not found");
      }

      if (
        !process.env.NEXT_PUBLIC_GLOBAL_CONFIG ||
        !process.env.NEXT_PUBLIC_PACKAGE
      ) {
        throw new Error("Global config or package not found");
      }

      const investorClaims = shares
        .filter((share) => share.sponsor === share.investor)
        .map((share) => share);
      const sponsorClaims = shares
        .filter((share) => share.sponsor !== share.investor)
        .map((share) => share);

      const tx = new Transaction();

      if (investorClaims.length > 0) {
        claim({
          tx,
          fundId: fund.object_id,
          shares: investorClaims.map((share) => share.share_id),
          address: account.address,
        });
      }

      if (sponsorClaims.length > 0) {
        claim({
          tx,
          fundId: fund.object_id,
          shares: sponsorClaims.map((share) => share.share_id),
          address: account.address,
          sponsorPoolId: sponsorClaims[0].sponsor,
        });
      }

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      await syncDb.claim();
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

export default useClaim;
