import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

const useGetBalance = (params?: { coinType?: string }) => {
  const coinType = params?.coinType;
  const suiclient = useSuiClient();
  const account = useCurrentAccount();
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    if (!account?.address) {
      return;
    }
    (async () => {
      const coinBalance = await suiclient.getBalance({
        owner: account?.address ?? "",
        coinType,
      });
      setBalance((Number(coinBalance.totalBalance) / 10 ** 9).toFixed(2));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  return balance;
};

export default useGetBalance;
