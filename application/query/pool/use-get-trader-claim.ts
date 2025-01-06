import { stingrayClient } from "@/application/stingray-client";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetTraderClaimProps = Omit<
  UseQueryOptions<{
    hisotries: { time: number; value: number }[];
    roi: string;
  }>,
  "queryKey"
> & {
  fundId?: string;
};

const useGetTraderClaim = (options?: UseGetTraderClaimProps) => {
  const fundId = options?.fundId;
  return useQuery({
    queryKey: ["trader-claim", fundId],
    queryFn: async () => {
      if (!fundId) {
        throw new Error("Fund id not found");
      }
      const response = await stingrayClient.getTraderClaim({
        fundId,
      });
      return response.json();
    },
    ...options,
    enabled: Boolean(fundId),
  });
};

export default useGetTraderClaim;
