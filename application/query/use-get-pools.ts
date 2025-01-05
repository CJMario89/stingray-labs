import { stingrayClient } from "@/application/stingray-client";
import { Fund } from "@/type";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetPoolsProps = Omit<UseQueryOptions<Fund[]>, "queryKey"> & {
  types: string[];
  order?: "asc" | "desc";
  orderBy?: string;
  searchText?: string;
  owner?: string;
  investor?: string;
};

const useGetPools = (options?: UseGetPoolsProps) => {
  const types = options?.types || [];
  const order = options?.order || "desc";
  const orderBy = options?.orderBy;
  const searchText = options?.searchText;
  const owner = options?.owner;
  const investor = options?.investor;
  return useQuery({
    queryKey: ["pools", types, order, orderBy, searchText, owner, investor],
    queryFn: async () => {
      const response = await stingrayClient.getPools({
        types,
        orderBy,
        order,
        searchText,
        owner,
        investor,
      });
      return response.json();
    },
    ...options,
    refetchInterval: 10000,
  });
};

export default useGetPools;
