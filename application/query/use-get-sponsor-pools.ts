import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { stingrayClient } from "../stingray-client";
import { getSuiService } from "@/common";
import { SuiObjectResponse } from "@mysten/sui/client";

type UseGetSponsorPoolsProps = Omit<
  UseQueryOptions<SuiObjectResponse[], Error, SuiObjectResponse[]>,
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
      return objects;
    },
    ...options,
  });
};

export default useGetSponsorPools;
