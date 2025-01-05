import { stingrayClient } from "@/application/stingray-client";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetPoolsProps = Omit<
  UseQueryOptions<{
    hisotries: { time: number; value: number }[];
    roi: string;
  }>,
  "queryKey"
> & {
  owner?: string;
};

const useGetPrevPoolPrice = (options?: UseGetPoolsProps) => {
  const owner = options?.owner;
  return useQuery({
    queryKey: ["prev-pool-price", owner],
    queryFn: async () => {
      if (!owner) {
        throw new Error("Owner not found");
      }
      const response = await stingrayClient.getPreviousPoolPrice({
        owner,
      });
      return response.json();
    },
    ...options,
    enabled: Boolean(owner),
  });
};

export default useGetPrevPoolPrice;
