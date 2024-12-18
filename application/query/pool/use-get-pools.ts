import { stingrayClient } from "@/application/stingray-client";
import { Fund } from "@/type";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetPoolsProps = Omit<UseQueryOptions<Fund[]>, "queryKey"> & {
  types: string[];
  order: "asc" | "desc";
  orderBy?: string;
};

const useGetPools = (options?: UseGetPoolsProps) => {
  const types = options?.types || [];
  const order = options?.order || "desc";
  const orderBy = options?.orderBy;
  return useQuery({
    queryKey: ["pools", types, order, orderBy],
    queryFn: async () => {
      const response = await stingrayClient.getPools({ types, orderBy, order });
      return response.json();
    },
    ...options,
  });
};

export default useGetPools;
