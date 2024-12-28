import { stingrayClient } from "@/application/stingray-client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetUserProps = UseQueryOptions<
  {
    address: string;
    name: string;
    image: Buffer;
    signature: string;
  },
  Error,
  {
    address: string;
    name: string;
    image: Buffer;
    signature: string;
  }
>;

const useGetUser = (options?: UseGetUserProps) => {
  const account = useCurrentAccount();
  return useQuery({
    queryKey: ["user", account?.address],
    queryFn: async () => {
      if (!account) {
        throw new Error("Account not found");
      }
      const response = await stingrayClient.GetUser({
        address: account.address,
      });
      const user = await response.json();
      return user;
    },
    enabled: !!account,
    ...options,
  });
};

export default useGetUser;
