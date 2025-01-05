import { stingrayClient } from "@/application/stingray-client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetUserProps = Omit<
  UseQueryOptions<
    {
      address: string;
      name: string;
      image: string;
      signature: string;
    },
    Error,
    {
      address: string;
      name: string;
      image: string;
      signature: string;
    }
  >,
  "queryKey"
> & { address?: string };

const useGetUser = (options?: UseGetUserProps) => {
  const account = useCurrentAccount();
  const address = options?.address || account?.address;
  return useQuery({
    queryKey: ["user", address],
    queryFn: async () => {
      if (!address) {
        throw new Error("address not found");
      }
      const response = await stingrayClient.GetUser({
        address,
      });
      const user = await response.json();
      return user;
    },
    enabled: !!address,
    ...options,
  });
};

export default useGetUser;
