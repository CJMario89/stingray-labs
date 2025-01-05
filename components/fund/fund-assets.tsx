import { Fund } from "@/type";
import React from "react";
import { secondaryGradient } from "../pool-list-template";
import useGetPoolBalance from "@/application/query/pool/use-get-pool-balance";
import Image from "next/image";
import { coins } from "@/constant/coin";

const FundAssets = ({ fund }: { fund?: Fund }) => {
  const { data: poolBalance } = useGetPoolBalance({
    fundId: fund?.object_id,
  });

  const balance = poolBalance?.balances;

  return (
    <div className={`${secondaryGradient} max-h-[200px] overflow-x-auto`}>
      <table className="table table-pin-rows table-pin-cols table-xs border-collapse border-spacing-0">
        <tbody>
          <tr>
            <td>Token</td>
            <td>Amount</td>
            <td>Status</td>
          </tr>
          {balance?.flatMap((b, index) => {
            const records = [];
            const coinIcon = coins.find(
              (coin) => coin.name === b.name,
            )?.iconUrl;
            if (Number(b.value) > 0) {
              records.push(
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-1">
                      <Image
                        alt="icon"
                        src={coinIcon ?? ""}
                        width={12}
                        height={12}
                        className="h-3 w-3 shrink-0 overflow-hidden rounded-full"
                      />
                      {b.name}
                    </div>
                  </td>
                  <td>{b.value}</td>
                  <td>Spot</td>
                </tr>,
              );
            }

            b.farmings.forEach((farming, index) => {
              if (Number(farming.value) > 0) {
                records.push(
                  <tr key={index}>
                    <td>
                      <div className="flex items-center gap-1">
                        <Image
                          alt="icon"
                          src={coinIcon ?? ""}
                          width={12}
                          height={12}
                          className="h-3 w-3 shrink-0 overflow-hidden rounded-full"
                        />
                        {farming.name}
                      </div>
                    </td>
                    <td>{farming.value}</td>
                    <td>Farming</td>
                  </tr>,
                );
              }
            });
            return records;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FundAssets;
