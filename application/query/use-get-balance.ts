import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

const useGetBalance = (params?: { coinType?: string }) => {
  const coinType = params?.coinType;
  const suiclient = useSuiClient();
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ["balance", account?.address, coinType],
    queryFn: async () => {
      if (!account?.address) {
        return;
      }
      const coinBalance = await suiclient.getBalance({
        owner: account?.address ?? "",
        coinType,
      });

      return (
        Number(coinBalance.totalBalance) /
        10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL)
      ).toFixed(2);
    },
    refetchInterval: 5000,
  });
};

export default useGetBalance;
