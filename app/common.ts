import { formatSuiPrice } from "@/common";
import { Fund } from "@/type";

export const getQuery = ({ req, keys }: { req: Request; keys: string[] }) => {
  const querys: Record<string, string> = {};
  keys.forEach((key) => {
    const value = new URL(req.url).searchParams.get(key);
    if (value) {
      querys[key] = value;
    }
  });
  return querys;
};

export const getFundStatistics = (_fund: unknown) => {
  const fund = _fund as Fund;
  const totalFunded = fund?.fund_history?.reduce((acc, cur) => {
    if (cur.action === "Invested") {
      return acc + cur.amount;
    } else {
      return acc - cur.amount;
    }
  }, 0);

  const investSet = new Set(
    fund?.fund_history?.map((history) => history.investor),
  );
  const investCount = investSet.size;
  return {
    totalFunded: formatSuiPrice(totalFunded ?? 0),
    totalInvestor: investCount,
  };
};

export const investTypeDuration: Record<string, number> = {
  "1w": 604800000,
  "1m": 2592000000,
  "3m": 7776000000,
  "1y": 31536000000,
};
