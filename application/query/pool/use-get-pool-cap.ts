import { getSuiService } from "@/common";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

const useGetPoolCap = ({ fundId }: { fundId?: string }) => {
  const account = useCurrentAccount();
  const suiService = getSuiService();
  return useQuery({
    queryKey: ["pool-cap", fundId, account?.address],
    queryFn: async () => {
      if (!account) {
        throw new Error("Account not found");
      }
      const packageId = process.env.NEXT_PUBLIC_PACKAGE;
      if (!packageId) {
        throw new Error("Package not found");
      }
      const objects = await suiService.queryObjects({
        owner: account?.address,
        module: "fund",
        packageId,
        type: "FundCap",
      });

      const object = objects.find((response) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = response.data?.content as any;
        return content?.fields?.fund_id === fundId;
      });

      return object?.data?.objectId;
    },
  });
};

export default useGetPoolCap;
