import TraderInfo from "@/common/trader-info";
import { coins } from "@/constant/coin";
import { Fund } from "@/type";
import { secondaryGradient } from "../pool-list-template";

const getTimeTooltip = (
  timestamp?: string | bigint | number,
  bottom = false,
) => {
  if (!timestamp) {
    return {};
  }
  return {
    className: bottom ? "tooltip tooltip-bottom" : "tooltip",
    "data-tip": Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date(Number(timestamp))),
  };
};

const FundHistory = ({ fund }: { fund?: Fund }) => {
  const history = fund?.fund_history;
  const tradingHistory = fund?.trader_operation;
  const hasSettled = fund?.settle_result && fund.settle_result?.length > 0;

  const columns = [
    ...(Boolean(hasSettled)
      ? [
          {
            first: <TraderInfo address={fund?.owner_id} iconSize={16} />,
            second: "Settled",
            third: "--",
            fourth: "--",
            time: fund?.settle_result?.[0].timestamp,
          },
        ]
      : []),
    ...(tradingHistory ?? []).map((item) => {
      const action = item.action;
      const isTokenOut = action === "Withdraw" || action === "Swap";
      const token = isTokenOut ? item.token_out : item.token_in;
      const coin = coins.find(
        (coin) => coin.typename.toLowerCase() === `0x${token.toLowerCase()}`,
      );
      const decimal = coin?.decimal ?? 0;
      const name = coin?.name ?? "--";
      const amount =
        (isTokenOut ? item.amount_out : item.amount_in) / Math.pow(10, decimal);
      return {
        first: <TraderInfo address={fund?.owner_id} iconSize={16} />,
        second: action,
        third: amount,
        fourth: name,
        time: item.timestamp,
      };
    }),

    ...(history ?? []).map((item) => {
      return {
        first: <TraderInfo address={item.investor} iconSize={16} />,
        second: item.action,
        third: item.amount,
        fourth: "USDC",
        time: item.timestamp,
      };
    }),

    ...(Boolean(fund)
      ? [
          {
            first: <TraderInfo address={fund?.owner_id} iconSize={16} />,
            second: "Created",
            third: "--",
            fourth: "--",
            time: fund?.timestamp,
          },
        ]
      : []),
  ];

  return (
    <div className={`${secondaryGradient} max-h-[200px] overflow-x-auto`}>
      <table className="table table-pin-rows table-pin-cols table-xs border-spacing-0">
        <tbody>
          {columns.map((column, index) => (
            <tr key={index}>
              <td>{column.first}</td>
              <td {...getTimeTooltip(column.time, index === 0 || index === 1)}>
                {column.second}
              </td>
              <td>{column.third}</td>
              <td>{column.fourth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FundHistory;
