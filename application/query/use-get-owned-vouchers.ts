import { getSuiService } from "@/common";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

const useGetOwnedVouchers = () => {
  const account = useCurrentAccount();
  const suiService = getSuiService();
  return useQuery({
    queryKey: ["voucher", account?.address],
    queryFn: async () => {
      if (!account) {
        throw new Error("Account not found");
      }
      const packageId = process.env.NEXT_PUBLIC_PACKAGE;
      if (!packageId) {
        throw new Error("Package not found");
      }
      const objects = await suiService.queryOwnedObjects({
        owner: account?.address,
        module: "voucher",
        packageId,
        type: "Voucher",
      });

      return objects;
    },
    enabled: !!account,
  });
};

export default useGetOwnedVouchers;
