import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import {
  Transaction,
  TransactionObjectArgument,
} from "@mysten/sui/transactions";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { syncDb } from "@/common/sync-db";
import toast from "react-hot-toast";

type UseDepositVoucherProps = UseMutationOptions<
  void,
  Error,
  {
    vouchers: {
      sponsorPoolId: string;
      sponsor: string;
      deadline: string;
      amount: string;
      id: string;
    }[];
  }
> & {
  fundId?: string;
};

const depositVoucher = ({
  tx,
  sponsorPoolId,
  voucherIds,
  fundId,
}: {
  tx: Transaction;
  sponsorPoolId: string;
  voucherIds: string[];
  fundId: string;
}) => {
  if (
    !process.env.NEXT_PUBLIC_GLOBAL_CONFIG ||
    !process.env.NEXT_PUBLIC_PACKAGE ||
    !process.env.NEXT_PUBLIC_FUND_BASE
  ) {
    throw new Error("Global config or package not found");
  }
  const consumeResponse = tx.moveCall({
    package: process.env.NEXT_PUBLIC_PACKAGE,
    module: "voucher",
    function: "consume",
    arguments: [
      tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG),
      tx.object(sponsorPoolId),
      tx.makeMoveVec({
        elements: voucherIds.map((voucherId) => tx.object(voucherId)),
      }),
      tx.object("0x6"),
    ],
    typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
  });

  const mintRequest = tx.moveCall({
    package: process.env.NEXT_PUBLIC_PACKAGE,
    module: "fund",
    function: "invest_with_voucher",
    arguments: [
      tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG),
      tx.makeMoveVec({
        type: `${process.env.NEXT_PUBLIC_PACKAGE_ASSET}::voucher::VoucherConsumeRequest<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
        elements: [consumeResponse[1]],
      }),
      tx.object(fundId),
      consumeResponse[0],
      tx.object("0x6"),
    ],
    typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
  });

  // mint share
  const share = tx.moveCall({
    package: process.env.NEXT_PUBLIC_PACKAGE,
    module: "fund_share",
    function: "mint",
    arguments: [
      tx.object(process.env.NEXT_PUBLIC_GLOBAL_CONFIG), //global config
      mintRequest, //mint request
    ],
    typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
  });
  return share;
};

const useDepositVoucher = (options?: UseDepositVoucherProps) => {
  const account = useCurrentAccount();
  const client = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction({
      onError: (error) => {
        console.error(error);
      },
    });

  return useMutation({
    mutationFn: async ({
      vouchers,
    }: {
      vouchers: {
        sponsorPoolId: string;
        sponsor: string;
        deadline: string;
        amount: string;
        id: string;
      }[];
    }) => {
      if (!account) {
        throw new Error("Account not found");
      }
      if (
        !process.env.NEXT_PUBLIC_GLOBAL_CONFIG ||
        !process.env.NEXT_PUBLIC_PACKAGE ||
        !process.env.NEXT_PUBLIC_FUND_BASE
      ) {
        throw new Error("Global config or package not found");
      }

      const fundId = options?.fundId;
      if (!fundId) {
        throw new Error("Fund id not found");
      }

      //split vouchers by sponsorPoolId
      const voucherMap = new Map<string, string[]>();
      vouchers.forEach((voucher) => {
        if (!voucherMap.has(voucher.sponsorPoolId)) {
          voucherMap.set(voucher.sponsorPoolId, []);
        }
        voucherMap.get(voucher.sponsorPoolId)?.push(voucher.id);
      });
      console.log(voucherMap);
      const tx = new Transaction();

      const shares: TransactionObjectArgument[] = [];

      voucherMap.forEach((voucherIds, sponsorPoolId) => {
        console.log(voucherIds, sponsorPoolId);
        const share = depositVoucher({ tx, sponsorPoolId, voucherIds, fundId });
        shares.push(share);
      });

      tx.transferObjects(shares, account?.address);

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      await syncDb.invest();
      console.log(result);
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
    onSuccess: async (data, variable, context) => {
      await syncDb.sponsorPool();
      toast.success(
        "Congratulations! You have successfully deposit with voucher!",
      );
      await client.invalidateQueries({
        queryKey: ["pool-balance", options?.fundId],
        type: "all",
      });
      await client.invalidateQueries({
        queryKey: ["sponsor-pools"],
        type: "all",
      });
      await client.invalidateQueries({
        queryKey: ["voucher"],
        type: "all",
      });
      options?.onSuccess?.(data, variable, context);
    },
  });
};

export default useDepositVoucher;
