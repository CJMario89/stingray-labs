import { stingrayClient } from "@/application/stingray-client";
import { TraderCard } from "@/type";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseGetTraderCardProps = Omit<UseQueryOptions<TraderCard>, "queryKey"> & {
  owner?: string;
  objectId?: string;
};

const useGetTraderCard = ({
  owner,
  objectId,
  ...options
}: UseGetTraderCardProps) => {
  return useQuery({
    queryKey: ["trader-card"],
    queryFn: async () => {
      const response = await stingrayClient.getTraderCard({ owner, objectId });
      return response.json();
    },
    ...options,
  });
};

export default useGetTraderCard;
