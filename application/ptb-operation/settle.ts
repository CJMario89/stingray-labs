import { Transaction } from "@mysten/sui/transactions";

export const settle = ({
  tx,
  fundId,
  poolTokens,
  address,
  initShareId,
}: {
  tx: Transaction;
  fundId: string;
  poolTokens: string[];
  address: string;
  initShareId: string;
}): {
  tx: Transaction;
} => {
  const packageId = process.env.NEXT_PUBLIC_PACKAGE;
  const configId = process.env.NEXT_PUBLIC_GLOBAL_CONFIG;
  if (!packageId || !configId) {
    throw new Error("Global config or package not found");
  }
  if (!process.env.NEXT_PUBLIC_FUND_BASE) {
    throw new Error("Fund base not found");
  }

  poolTokens.forEach((poolToken) => {
    console.log(poolToken);
    console.log(process.env.NEXT_PUBLIC_FUND_BASE);
    if (!process.env.NEXT_PUBLIC_FUND_BASE) {
      throw new Error("Fund base not found");
    }
    tx.moveCall({
      package: packageId,
      module: "fund",
      function: "check_and_clean",
      arguments: [tx.object(fundId)],
      typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE, poolToken],
    });
  });

  const request = tx.moveCall({
    package: packageId,
    module: "fund",
    function: "create_settle_request",
    arguments: [
      tx.object(configId),
      tx.object(fundId),
      tx.pure.bool(true),
      tx.object(initShareId),
    ],
    typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
  });

  const coin = tx.moveCall({
    package: packageId,
    module: "fund",
    function: "settle",
    arguments: [tx.object(configId), tx.object(fundId), tx.object(request)],
    typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
  });

  tx.transferObjects([coin], address);

  return { tx };
};
