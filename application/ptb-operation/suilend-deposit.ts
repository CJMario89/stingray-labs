import {
  SUILEND_DEPOSIT,
  SUILEND_LENDING_MARKET,
  SUILEND_PLATFORM_TYPE,
} from "@/constant/defi-data/suilend";
import { Transaction } from "@mysten/sui/transactions";

export const suilendDeposit = ({
  tx,
  name,
  fundId,
  cap,
  amount,
}: {
  tx: Transaction;
  name: string;
  fundId: string;
  cap?: string;
  amount: string;
}): { tx: Transaction } => {
  const packageId = process.env.NEXT_PUBLIC_PACKAGE;
  const configId = process.env.NEXT_PUBLIC_GLOBAL_CONFIG;
  if (!packageId || !configId) {
    throw new Error("Global config or package not found");
  }
  const suilendDepositInfo = SUILEND_DEPOSIT.find((item) => item.name === name);
  if (!suilendDepositInfo) {
    throw new Error("Bucket withdraw info not found");
  }

  if (!cap) {
    throw new Error("Cap not found");
  }

  if (!process.env.NEXT_PUBLIC_FUND_BASE) {
    throw new Error("Fund base not found");
  }

  const [takeAsset, takeRequest] = tx.moveCall({
    package: packageId,
    module: "fund",
    function: "take_1_liquidity_for_1_liquidity_by_trader",
    arguments: [
      tx.object(configId),
      tx.object(cap),
      tx.object(fundId),
      tx.pure.u64(Number(amount) * suilendDepositInfo.inputDecimal),
      tx.object("0x6"),
    ],
    typeArguments: [
      suilendDepositInfo.inputType,
      suilendDepositInfo.outputType,
      process.env.NEXT_PUBLIC_FUND_BASE,
    ],
  });

  const deposit_coin = tx.moveCall({
    package: "0x2",
    module: "coin",
    function: "from_balance",
    arguments: [takeAsset],
    typeArguments: [suilendDepositInfo.inputType],
  });

  const proof_coin = tx.moveCall({
    package: packageId,
    module: "suilend",
    function: "deposit",
    arguments: [
      tx.object(takeRequest),
      deposit_coin,
      tx.object(SUILEND_LENDING_MARKET),
      tx.pure.u64(suilendDepositInfo.reserveIdx),
      tx.object("0x6"),
    ],
    typeArguments: [SUILEND_PLATFORM_TYPE, suilendDepositInfo.inputType],
  });

  const put_balance = tx.moveCall({
    package: "0x2",
    module: "coin",
    function: "into_balance",
    arguments: [proof_coin],
    typeArguments: [suilendDepositInfo.outputType],
  });

  tx.moveCall({
    package: packageId,
    module: "fund",
    function: "put_1_liquidity_for_1_liquidity_by_all",
    arguments: [
      tx.object(configId),
      tx.object(fundId),
      tx.object(takeRequest),
      put_balance,
    ],
    typeArguments: [
      suilendDepositInfo.inputType,
      suilendDepositInfo.outputType,
      process.env.NEXT_PUBLIC_FUND_BASE,
    ],
  });
  return { tx };
};
