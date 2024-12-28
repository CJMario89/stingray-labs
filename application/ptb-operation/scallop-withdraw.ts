import {
  SCALLOP_DEPOSIT,
  SCALLOP_MARKET,
  SCALLOP_VERSION,
  SCALLOP_WITHDRAW,
} from "@/constant/defi-data/scallop";
import { Transaction } from "@mysten/sui/transactions";

export const scallopWithdraw = ({
  tx,
  name,
  liquidityAmount,
  reStakeAmount,
  fundId,
  cap,
}: {
  tx: Transaction;
  name: string;
  liquidityAmount: number;
  reStakeAmount: number;
  fundId: string;
  cap?: string;
}): {
  tx: Transaction;
} => {
  const packageId = process.env.NEXT_PUBLIC_PACKAGE;
  const configId = process.env.NEXT_PUBLIC_GLOBAL_CONFIG;
  if (!packageId || !configId) {
    throw new Error("Global config or package not found");
  }
  const scallopWithdrawInfo = SCALLOP_WITHDRAW.find(
    (item) => item.name === name,
  );
  if (!scallopWithdrawInfo) {
    throw new Error("Bucket withdraw info not found");
  }

  if (!cap) {
    throw new Error("Cap not found");
  }

  const [takeAsset, takeRequest] = tx.moveCall({
    package: packageId,
    module: "fund",
    function: "take_1_liquidity_for_1_liquidity_by_trader",
    arguments: [
      tx.object(configId),
      tx.object(cap),
      tx.object(fundId),
      tx.pure.u64(Number(liquidityAmount)),
      tx.object("0x6"),
    ],
    typeArguments: [
      scallopWithdrawInfo.inputType,
      scallopWithdrawInfo.outputType,
      "0x2::sui::SUI",
    ],
  });

  const proof_coin = tx.moveCall({
    package: "0x2",
    module: "coin",
    function: "from_balance",
    arguments: [takeAsset],
    typeArguments: [scallopWithdrawInfo.inputType],
  });
  const outputAsset = tx.moveCall({
    package: packageId,
    module: "scallop",
    function: "withdraw",
    arguments: [
      tx.object(takeRequest),
      proof_coin,
      tx.object(SCALLOP_VERSION),
      tx.object(SCALLOP_MARKET),
      tx.object("0x6"),
    ],
    typeArguments: [scallopWithdrawInfo.outputType],
  });

  const put_balance = tx.moveCall({
    package: "0x2",
    module: "coin",
    function: "into_balance",
    arguments: [outputAsset],
    typeArguments: [scallopWithdrawInfo.outputType],
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
      scallopWithdrawInfo.inputType,
      scallopWithdrawInfo.outputType,
      "0x2::sui::SUI",
    ],
  });

  if (!isNaN(Number(reStakeAmount)) && Number(reStakeAmount) > 0) {
    const scallopDepositInfo = SCALLOP_DEPOSIT.find(
      (item) => item.name === name,
    );
    if (!scallopDepositInfo) {
      throw new Error("Bucket withdraw info not found");
    }

    const [takeAsset, takeRequest] = tx.moveCall({
      package: packageId,
      module: "fund",
      function: "take_1_liquidity_for_1_liquidity_by_trader",
      arguments: [
        tx.object(configId),
        tx.object(cap),
        tx.object(fundId),
        tx.pure.u64(reStakeAmount),
        tx.object("0x6"),
      ],
      typeArguments: [
        scallopDepositInfo.inputType,
        scallopDepositInfo.outputType,
        "0x2::sui::SUI",
      ],
    });

    const deposit_coin = tx.moveCall({
      package: "0x2",
      module: "coin",
      function: "from_balance",
      arguments: [takeAsset],
      typeArguments: [scallopDepositInfo.inputType],
    });

    const proof_coin = tx.moveCall({
      package: packageId,
      module: "scallop",
      function: "deposit",
      arguments: [
        tx.object(takeRequest),
        deposit_coin,
        tx.object(SCALLOP_VERSION),
        tx.object(SCALLOP_MARKET),
        tx.object("0x6"),
      ],
      typeArguments: [scallopDepositInfo.inputType],
    });

    const put_balance = tx.moveCall({
      package: "0x2",
      module: "coin",
      function: "into_balance",
      arguments: [proof_coin],
      typeArguments: [scallopDepositInfo.outputType],
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
        scallopDepositInfo.inputType,
        scallopDepositInfo.outputType,
        "0x2::sui::SUI",
      ],
    });
  }
  return { tx };
};
