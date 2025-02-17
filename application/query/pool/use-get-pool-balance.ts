import { stingrayClient } from "@/application/stingray-client";
import { FundBalance } from "@/type";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetPoolBalanceProps = Omit<
  UseQueryOptions<{
    balances: FundBalance;
    usdc: number;
    trading: number;
    farming: number;
    total: number;
    percent: {
      usdc: number;
      trading: number;
      farming: number;
    };
  }> & { fundId?: string },
  "queryKey"
>;

const useGetPoolBalance = (options?: UseGetPoolBalanceProps) => {
  const fundId = options?.fundId ?? "";
  return useQuery({
    queryKey: ["pool-balance", fundId],
    queryFn: async () => {
      const response = await stingrayClient.getPoolBalance({ fundId });
      const data = await response.json();
      return data;
    },
    ...options,
    enabled: !!fundId,
    refetchInterval: 3000,
  });
};

export default useGetPoolBalance;
