import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { stingrayClient } from "../stingray-client";
import { getSuiService } from "@/common";

export type SponsorPool = {
  sponsorPoolId: string;
  sponsor: string;
  amountPerVoucher: string;
  remaining: string;
  remainTimes: string;
  totalTimes: string;
};

type UseGetSponsorPoolsProps = Omit<
  UseQueryOptions<SponsorPool[], Error, SponsorPool[]>,
  "queryKey"
>;

const useGetSponsorPools = (options?: UseGetSponsorPoolsProps) => {
  return useQuery({
    queryKey: ["sponsor-pools"],
    queryFn: async () => {
      const response = await stingrayClient.getSponsorPools();
      const pools = await response.json();
      const suiService = getSuiService();
      const objects = await suiService.queryObjects({
        ids: pools.map((pool: { id: string }) => pool.id),
      });
      return objects
        .filter((object) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const content = object.data?.content as any;
          const fields = content?.fields?.settings?.fields;
          const deadline = fields?.deadline;
          const remaining = fields?.remaining;
          const amountPerVoucher = fields?.amount_per_time;
          if (deadline < Date.now()) {
            return false;
          }
          if (remaining < amountPerVoucher) {
            return false;
          }
          return true;
        })
        .map((object) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const content = object.data?.content as any;
          const fields = content?.fields?.settings?.fields;
          const sponsor = content?.fields?.sponsor_addr;
          const amountPerVoucher = fields?.amount_per_time;
          const remaining = fields?.remaining;
          const totalTimes = fields?.mint_times;
          const remainTimes = Math.floor(
            remaining / amountPerVoucher,
          ).toString();

          return {
            sponsorPoolId: object.data?.objectId ?? "",
            sponsor,
            amountPerVoucher,
            remaining,
            totalTimes,
            remainTimes,
          };
        });
    },
    ...options,
  });
};

export default useGetSponsorPools;
