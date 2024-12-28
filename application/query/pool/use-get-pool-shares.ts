import { FundHistory } from "@/type";
import { useCurrentAccount } from "@mysten/dapp-kit";

const useGetPoolShares = ({
  history: _history = [],
}: {
  history?: FundHistory[];
}) => {
  const account = useCurrentAccount();

  const history = [..._history];
  history?.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  history?.shift();

  const shares = history?.filter((h) => h.investor === account?.address);

  const total = history?.length
    ? shares.reduce((acc, cur) => {
        acc =
          cur.action === "Invested"
            ? acc + Number(cur.amount)
            : acc - Number(cur.amount);
        return acc;
      }, 0)
    : 0;

  return {
    total: total.toFixed(9).replace(/\.?0+$/, ""),
    shares: history
      .filter((history) => history.investor === account?.address)
      ?.map((history) => history.share_id),
    withdrawableShares: history
      ?.filter((h) => !h?.redeemed)
      ?.filter((h) => h.investor === account?.address)
      ?.map((h) => h?.share_id),
  };
};

export default useGetPoolShares;
