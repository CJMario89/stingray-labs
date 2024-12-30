import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type useGetPoolTokensProps = Omit<
  UseQueryOptions<string[]> & {
    fundId?: string;
  },
  "queryKey"
>;

const useGetPoolTokens = ({ fundId, ...options }: useGetPoolTokensProps) => {
  return useQuery({
    queryKey: ["pool-tokens", fundId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pool/all-token?fundId=${fundId}`,
        {
          method: "GET",
        },
      );
      return response.json();
    },
    ...options,
    enabled: !!fundId,
  });
};

export default useGetPoolTokens;
