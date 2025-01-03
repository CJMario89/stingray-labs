import { stingrayClient } from "@/application/stingray-client";
import { Fund } from "@/type";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetPoolsProps = Omit<UseQueryOptions<Fund[]>, "queryKey"> & {
  types: string[];
  order?: "asc" | "desc";
  orderBy?: string;
  searchText?: string;
  owner?: string;
};

const useGetPools = (options?: UseGetPoolsProps) => {
  const types = options?.types || [];
  const order = options?.order || "desc";
  const orderBy = options?.orderBy;
  const searchText = options?.searchText;
  const owner = options?.owner;
  return useQuery({
    queryKey: ["pools", types, order, orderBy, searchText, owner],
    queryFn: async () => {
      const response = await stingrayClient.getPools({
        types,
        orderBy,
        order,
        searchText,
        owner,
      });
      return response.json();
    },
    ...options,
  });
};

export default useGetPools;
