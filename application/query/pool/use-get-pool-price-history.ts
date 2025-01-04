import { stingrayClient } from "@/application/stingray-client";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetPoolPriceHistoryProps = Omit<
  UseQueryOptions<
    {
      time: number;
      value: number;
    }[]
  >,
  "queryKey"
> & {
  fundId?: string;
};

const useGetPoolPriceHistory = (options?: UseGetPoolPriceHistoryProps) => {
  const fundId = options?.fundId;
  return useQuery({
    queryKey: ["pool-price-history", fundId],
    queryFn: async () => {
      if (!fundId) {
        return;
      }
      const response = await stingrayClient.getPoolPriceHistory({
        fundId,
      });
      return response.json();
    },
    ...options,
    enabled: !!fundId,
  });
};

export default useGetPoolPriceHistory;
