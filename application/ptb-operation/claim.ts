import { Transaction } from "@mysten/sui/transactions";

export const claim = ({
  tx,
  fundId,
  sponsorPoolId,
  shares,
  address,
}: {
  tx: Transaction;
  fundId: string;
  sponsorPoolId?: string;
  shares: string[];
  address: string;
}): { tx: Transaction } => {
  const packageId = process.env.NEXT_PUBLIC_PACKAGE;
  const configId = process.env.NEXT_PUBLIC_GLOBAL_CONFIG;
  if (!packageId || !configId) {
    throw new Error("Global config or package not found");
  }

  if (!process.env.NEXT_PUBLIC_FUND_BASE) {
    throw new Error("Fund base not found");
  }
  console.log(shares);
  const coin = tx.moveCall({
    package: packageId,
    module: "fund",
    function: "claim",
    arguments: [
      tx.object(configId),
      tx.object.option({
        type: `${process.env.NEXT_PUBLIC_PACKAGE_ASSET}::voucher::SponsorPool<${process.env.NEXT_PUBLIC_FUND_BASE}>`,
        value: sponsorPoolId ?? null,
      }),
      tx.object(fundId),
      tx.makeMoveVec({
        elements: shares.map((share) => tx.object(share)),
      }), //shares
    ],
    typeArguments: [process.env.NEXT_PUBLIC_FUND_BASE],
  });
  tx.transferObjects([coin], address);
  return { tx };
};
