import { useCurrentAccount } from "@mysten/dapp-kit";
import { sponsor_pool } from "@prisma/client";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { stingrayClient } from "../stingray-client";

type UseGetMintedVouchersProps = Omit<
  UseQueryOptions<sponsor_pool[], Error, sponsor_pool[]>,
  "queryKey"
> & { sponsorPoolId?: string };

const useGetMintedVouchers = (options?: UseGetMintedVouchersProps) => {
  const sponsorPoolId = options?.sponsorPoolId;
  const account = useCurrentAccount();
  return useQuery({
    queryKey: ["minted-voucher", account?.address, sponsorPoolId],
    queryFn: async () => {
      if (!account) {
        throw new Error("Account not found");
      }
      if (!sponsorPoolId || !account) {
        return;
      }
      const response = await stingrayClient.getMintedVoucher({
        sponsorPoolId,
        minter: account.address,
      });

      return response.json();
    },
    enabled: !!account,
    ...options,
  });
};

export default useGetMintedVouchers;
