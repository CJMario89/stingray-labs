import { stingrayClient } from "@/application/stingray-client";
import { Fund } from "@/type";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetPoolsProps = UseQueryOptions<Fund[]>;

const useGetPools = (options?: UseGetPoolsProps) => {
  return useQuery({
    queryKey: ["pools"],
    queryFn: async () => {
      const response = await stingrayClient.getPools();
      return response.json();
    },
    ...options,
  });
};

export default useGetPools;
