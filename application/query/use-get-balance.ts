import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

const useGetBalance = (params?: { coinType?: string }) => {
  const coinType = params?.coinType;
  const suiclient = useSuiClient();
  const account = useCurrentAccount();
  const [balance, setBalance] = useState<string>("");
  console.log(account?.address);
  console.log(coinType);
  useEffect(() => {
    if (!account?.address) {
      return;
    }
    (async () => {
      if (!coinType) {
        return;
      }
      const coinBalance = await suiclient.getBalance({
        owner: account?.address ?? "",
        coinType,
      });
      console.log(coinBalance);
      console.log(coinType);
      console.log(Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL));
      setBalance(
        (
          Number(coinBalance.totalBalance) /
          10 ** Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL)
        ).toFixed(2),
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address, coinType]);

  return balance;
};

export default useGetBalance;
