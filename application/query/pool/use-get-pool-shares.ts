import { FundHistory } from "@/type";
import { useCurrentAccount } from "@mysten/dapp-kit";

const useGetPoolShares = ({
  history: _history = [],
}: {
  history?: FundHistory[];
}) => {
  const account = useCurrentAccount();
  const decimal = Number(process.env.NEXT_PUBLIC_FUND_BASE_DECIMAL ?? 6);
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
  const withdrawableShares = history
    ?.filter((h) => !h?.redeemed)
    ?.filter((h) => h.investor === account?.address)
    ?.filter((h) => h.sponsor === account?.address);
  return {
    total: total.toFixed(decimal).replace(/\.?0+$/, ""),
    shares: history
      .filter((history) => history.investor === account?.address)
      ?.map((history) => history.share_id),
    withdrawableShares: withdrawableShares?.map((history) => history.share_id),
    withdrawable: withdrawableShares
      ?.reduce((acc, cur) => {
        acc += Number(cur.amount);
        return acc;
      }, 0)
      .toFixed(decimal)
      .replace(/\.?0+$/, ""),
  };
};

export default useGetPoolShares;
