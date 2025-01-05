import TraderInfo from "@/common/trader-info";
import { coins } from "@/constant/coin";
import { Fund } from "@/type";
import { secondaryGradient } from "../pool-list-template";

const FundHistory = ({ fund }: { fund?: Fund }) => {
  const history = fund?.fund_history;
  const tradingHistory = fund?.trader_operation;
  const hasSettled = fund?.settle_result && fund.settle_result?.length > 0;
  return (
    <div className={`${secondaryGradient} max-h-[200px] overflow-x-auto`}>
      <table className="table table-pin-rows table-pin-cols table-xs border-spacing-0">
        <tbody>
          {Boolean(hasSettled) && (
            <tr>
              <td>
                <TraderInfo address={fund?.owner_id} iconSize={16} />
              </td>
              <td>Settled</td>
              <td>--</td>
              <td>--</td>
            </tr>
          )}
          {tradingHistory?.map((item, index) => {
            const action = item.action;
            const isWithdraw = action === "Withdraw";
            const token = isWithdraw ? item.token_out : item.token_in;
            const coin = coins.find(
              (coin) =>
                coin.typename.toLowerCase() === `0x${token.toLowerCase()}`,
            );
            const decimal = coin?.decimal ?? 0;
            const name = coin?.name ?? "--";
            const amount = item.amount_in / Math.pow(10, decimal);
            console.log(coin);
            console.log(item.token_in);
            return (
              <tr key={index}>
                <td>
                  <TraderInfo address={fund?.owner_id} iconSize={16} />
                </td>
                <td>{action}</td>
                <td>{amount}</td>
                <td>{name}</td>
              </tr>
            );
          })}
          {history?.map((item, index) => {
            return (
              <tr key={index}>
                <td>
                  <TraderInfo address={item.investor} iconSize={16} />
                </td>
                <td>{item.action}</td>
                <td>{item.amount}</td>
                <td>USDC</td>
              </tr>
            );
          })}
          {
            <tr>
              <td>
                <TraderInfo address={fund?.owner_id} iconSize={16} />
              </td>
              <td>Created</td>
              <td>--</td>
              <td>--</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default FundHistory;
