import { getSuiService } from "@/common";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { UseMutationOptions, useQuery } from "@tanstack/react-query";

type UseGetOwnedVouchersProps = UseMutationOptions<
  {
    sponsorPoolId: string;
    sponsor: string;
    deadline: string;
    amount: string;
    id: string;
  },
  Error,
  {
    sponsorPoolId: string;
    sponsor: string;
    deadline: string;
    amount: string;
    id: string;
  }
> & { sponsor?: string; sponsorPoolId?: string };

const useGetOwnedVouchers = (options?: UseGetOwnedVouchersProps) => {
  const sponsor = options?.sponsor;
  const account = useCurrentAccount();
  const suiService = getSuiService();
  return useQuery({
    queryKey: ["voucher", account?.address, sponsor],
    queryFn: async () => {
      if (!account) {
        return [];
      }
      console.log(account, "account");
      console.log(sponsor, "sponsor");
      if (!account) {
        throw new Error("Account not found");
      }
      const packageId = process.env.NEXT_PUBLIC_PACKAGE_ASSET;
      if (!packageId) {
        throw new Error("Package not found");
      }
      const objects = await suiService.queryOwnedObjects({
        owner: account?.address,
        module: "voucher",
        packageId,
        type: "Voucher",
      });
      return objects
        .filter((object) => {
          let flag = true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const content = object.data?.content as any;
          if (sponsor) {
            flag = content.fields?.info?.fields?.sponsor_addr === sponsor;
          }

          return flag;
        })
        .map((object) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const content = object.data?.content as any;
          const fields = content.fields?.info?.fields;
          return {
            sponsorPoolId: content.fields?.sponsor_pool,
            sponsor: fields?.sponsor_addr,
            deadline: fields?.deadline,
            amount: fields?.amount,
            id: object.data?.objectId ?? "",
          };
        });
    },
    ...options,
  });
};

export default useGetOwnedVouchers;
