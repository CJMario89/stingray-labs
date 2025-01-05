import { FundBalance } from "@/type";
import { Transaction } from "@mysten/sui/transactions";
import { suilendWithdraw } from "./suilend-withdraw";
import { scallopWithdraw } from "./scallop-withdraw";
import { bucketWithdraw } from "./bucket-withdraw";
import { swap } from "./swap";
import { coins } from "@/constant/coin";

export const settleBackToUsdc = ({
  tx,
  fundBalance,
  fundId,
  cap,
}: {
  tx: Transaction;
  fundBalance: FundBalance;
  fundId: string;
  cap?: string;
}) => {
  const swapBalance: { [key: string]: number } = {};

  fundBalance.forEach((balance) => {
    swapBalance[balance.name] = Number(balance.value);
  });

  if (!cap) {
    throw new Error("Cap not found");
  }

  fundBalance.forEach((balance) => {
    balance.farmings.forEach((farming) => {
      if (farming.protocol === "Suilend") {
        console.log("suilendWithdraw", farming);
        suilendWithdraw({
          tx,
          name: balance.name,
          cap,
          fundId,
          liquidityAmount: farming.liquidityValue,
          reStakeAmount: 0,
        });
        swapBalance[balance.name] += Number(farming.value);
      }
      if (farming.protocol === "Scallop") {
        console.log("scallopWithdraw", farming);
        scallopWithdraw({
          tx,
          name: balance.name,
          cap,
          fundId,
          liquidityAmount: farming.liquidityValue,
          reStakeAmount: 0,
        });
        swapBalance[balance.name] += Number(farming.value);
      }
      if (farming.protocol === "Bucket") {
        console.log("bucketWithdraw", farming);
        bucketWithdraw({
          tx,
          name: balance.name,
          cap,
          fundId,
          reStakeAmount: 0,
        });
        swapBalance[balance.name] += Number(farming.value);
      }
    });
  });
  Object.entries(swapBalance).forEach(([name, value]) => {
    if (name === "USDC") return;
    if (value <= 0) return;
    // count++;

    // if (count > 1) return;

    const coin = coins.find((coin) => coin.name === name);
    if (!coin) return;

    swap({
      tx,
      inToken: name,
      outToken: "USDC",
      // (Math.floor(value * Math.pow(10, coin?.decimal)) - 1) /
      inAmount: (
        (Math.floor(value * Math.pow(10, coin?.decimal)) - 1) /
        Math.pow(10, coin?.decimal)
      ).toString(),
      cap,
      fundId,
      isMax: true,
    });
  });

  return tx;
};
