/* eslint-disable @typescript-eslint/no-explicit-any */
import { Quoter } from "@/common/quote";
import { coins } from "@/constant/coin";
import { PRICE_FEE } from "@/constant/price";
import { prisma } from "@/prisma";
import { Farming } from "@/type";

export const revalidate = 0;
import { createClient, RedisClientType } from "redis";

let client: RedisClientType;
(async () => {
  client = createClient();
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
})();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fundId = url.searchParams.get("fundId");
  if (!fundId) {
    return Response.error();
  }

  const [fund, scallopOperations] = await Promise.all([
    prisma.fund.findUnique({
      where: {
        object_id: fundId,
      },
      include: {
        fund_history: true,
        trader_operation: true,
      },
    }),
    prisma.$queryRaw`
      SELECT * FROM "trader_operation" WHERE protocol = 'Scallop' AND fund_object_id = ${fundId}
      ORDER BY timestamp DESC, event_seq DESC;`,
  ]);

  const getDisplayValue = (value: string, decimal: number) => {
    return (Number(value) / Math.pow(10, decimal))
      .toFixed(decimal)
      .replace(/\.?0+$/, "");
  };

  const tokens = coins.map((coin) => {
    let balance = 0;
    const farmings: Farming[] = [];
    const coinTypeName = coin.typename.slice(2);
    // funded (spot)
    if (coin.name === "USDC") {
      const funded =
        fund?.fund_history?.reduce((acc, curr) => {
          if (curr.action === "Invested") {
            acc += Number(curr.amount);
          } else if (curr.action === "Deinvested") {
            acc -= Number(curr.amount);
          }
          return acc;
        }, 0) ?? 0;
      balance = funded;
    }
    // swapped (spot)
    const swapPaid =
      fund?.trader_operation?.reduce((acc, curr) => {
        if (curr.token_in === coinTypeName && curr.action === "Swap") {
          acc += Number(curr.amount_in);
        }
        return acc;
      }, 0) ?? 0;
    console.log(swapPaid, "swapPaid");
    const swapReceived =
      fund?.trader_operation?.reduce((acc, curr) => {
        if (curr.token_out === coinTypeName && curr.action === "Swap") {
          acc += Number(curr.amount_out);
        }
        return acc;
      }, 0) ?? 0;

    // deposit (spot)

    const depositPaid =
      fund?.trader_operation?.reduce((acc, curr) => {
        if (curr.token_in === coinTypeName && curr.action === "Deposit") {
          acc += Number(curr.amount_in);
        }
        return acc;
      }, 0) ?? 0;

    // withdraw (spot)

    const withdrawReceived =
      fund?.trader_operation?.reduce((acc, curr) => {
        if (curr.token_out === coinTypeName && curr.action === "Withdraw") {
          acc += Number(curr.amount_out);
          return acc;
        }
        return acc;
      }, 0) ?? 0;

    const withdrawPositionScallop: string[] = [];
    const farmingPositionScallop = (
      scallopOperations as any[]
    )?.reduce<Farming>(
      (acc, curr) => {
        if (
          curr.token_out === coinTypeName &&
          curr.action === "Withdraw" &&
          curr.protocol === "Scallop"
        ) {
          withdrawPositionScallop.push(curr.token_out);
        }
        if (
          curr.token_in === coinTypeName &&
          curr.action === "Deposit" &&
          curr.protocol === "Scallop" &&
          !withdrawPositionScallop.includes(curr.token_in)
        ) {
          // const displayThreshold = (10 / 10) * coin.decimal; // 10 unit
          // const amountIn =
          //   Number(curr.amount_in) > displayThreshold
          //     ? Number(curr.amount_in)
          //     : 0;

          acc.name = coin.name;
          // acc.value = (Number(acc.value) + amountIn).toString();
          acc.value = (Number(acc.value) + Number(curr.amount_in)).toString();
          acc.liquidityTypename = curr.token_out;
          acc.liquidityValue = Number(curr.amount_out) + acc.liquidityValue;
          acc.protocol = "Scallop";
        }

        return acc;
      },
      {
        name: "",
        value: "0",
        liquidityTypename: "",
        liquidityValue: 0,
        protocol: "",
      },
    );

    if (farmingPositionScallop && farmingPositionScallop?.name !== "") {
      farmings.push({
        ...farmingPositionScallop,
        value: getDisplayValue(farmingPositionScallop.value, coin.decimal),
      });
    }

    const bucketOperation = fund?.trader_operation?.filter(
      (operation) =>
        operation.protocol === "Bucket" &&
        (operation.token_in === coinTypeName ||
          operation.token_out === coinTypeName),
    );
    const farmingPositionBucket =
      bucketOperation?.[bucketOperation?.length - 1]?.action === "Deposit"
        ? {
            name: coin.name,
            value: getDisplayValue(
              bucketOperation?.[
                bucketOperation?.length - 1
              ].amount_in.toString(),
              coin.decimal,
            ),
            liquidityTypename:
              bucketOperation?.[bucketOperation?.length - 1].token_out,
            liquidityValue: Number(
              bucketOperation?.[bucketOperation?.length - 1].amount_out,
            ),
            protocol: "Bucket",
          }
        : undefined;
    if (farmingPositionBucket && farmingPositionBucket?.name !== "") {
      farmings.push(farmingPositionBucket);
    }

    balance =
      balance + swapReceived - swapPaid - depositPaid + withdrawReceived;

    if (coin.name === "BUCK") {
      balance = balance < 10 ? 0 : balance;
    }
    const displayThreshold = (10 / 10) * coin.decimal; // 10 unit
    balance = balance < displayThreshold ? 0 : balance;
    if (coin.name === "SUI") {
      console.log(displayThreshold);
      console.log(balance);
      console.log("SUI-------------------------");
    }

    return {
      name: coin.name,
      typename: coin.typename,
      value: getDisplayValue(balance.toString(), coin.decimal),
      decimal: coin.decimal,
      farmings,
    };
  });
  const quoter = new Quoter();

  let SUIUSD: number | undefined = 0;

  if (client?.isReady) {
    const key = `SUIUSD`;
    const cachedQuote = await client.get(key);
    if (cachedQuote) {
      const { r } = JSON.parse(cachedQuote);
      SUIUSD = r;
    }
  }

  if (!SUIUSD) {
    SUIUSD = await quoter.pythPriceEstimate(PRICE_FEE[10].priceFeeId);
    if (SUIUSD) {
      await client.set(`SUIUSD`, JSON.stringify({ r: SUIUSD }), {
        EX: 5,
      });
    }
  }

  const balances = await Promise.all(
    tokens.map(async (token) => {
      const shouldGetPriceRate =
        Number(token.value) > 0 || token.farmings.length > 0;
      let rate;
      let inUSD = 0;
      if (shouldGetPriceRate) {
        const inToken = PRICE_FEE.findIndex(
          (price) => price.name === token.name,
        );

        if (client?.isReady) {
          const key = `${inToken}-${2}-${1}-${"in"}`;
          const cachedQuote = await client.get(key);
          if (cachedQuote) {
            const { r } = JSON.parse(cachedQuote);
            rate = r;
          }
        }

        if (!rate) {
          rate = await quoter.quote(inToken, 2, 1, "in");
          await client.set(
            `${inToken}-${10}-${1}-${"in"}`,
            JSON.stringify({ r: rate }),
            {
              EX: 5,
            },
          );
        }

        inUSD = rate * Number(token.value) * (SUIUSD ?? 0);
      }
      return {
        ...token,
        rate,
        inUSD,
      };
    }),
  );
  const usdc =
    Number(balances?.find((balance) => balance.name === "USDC")?.value) ?? 0;

  const trading =
    balances
      ?.filter((balance) => balance.name !== "USDC")
      ?.reduce((acc, balance) => {
        const priceRate = balance.rate;
        if (!priceRate) return acc;

        return acc + priceRate * Number(balance.value);
      }, 0) ?? 0;

  const farming =
    balances?.reduce((acc, balance) => {
      const priceRate = balance.rate;
      if (!priceRate) return acc;

      const totalFarming =
        priceRate *
        (balance.farmings?.reduce((acc, farming) => {
          return acc + Number(farming.value);
        }, 0) || 0);
      return acc + totalFarming;
    }, 0) ?? 0;

  return Response.json({
    balances,
    usdc,
    trading,
    farming,
    total: usdc + trading + farming,
    percent: {
      usdc: (usdc / (usdc + trading + farming)) * 100,
      trading: (trading / (usdc + trading + farming)) * 100,
      farming: (farming / (usdc + trading + farming)) * 100,
    },
  });
}
