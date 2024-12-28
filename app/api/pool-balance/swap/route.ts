/* eslint-disable @typescript-eslint/no-explicit-any */
import { coins } from "@/constant/coin";
import { prisma } from "@/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fundId = url.searchParams.get("fundId");
  if (!fundId) {
    return Response.error();
  }

  const fund = await prisma.fund.findUnique({
    where: {
      object_id: fundId,
    },
    include: {
      fund_history: true,
      trader_operation: true,
    },
  });

  const getDisplayValue = (value: string, decimal: number) => {
    return (Number(value) / Math.pow(10, decimal))
      .toFixed(decimal)
      .replace(/\.?0+$/, "");
  };

  const suiTypename = coins
    ?.find((coin) => coin.name === "SUI")
    ?.typename.slice(2);
  const swapPaid =
    fund?.trader_operation?.reduce((acc, curr) => {
      if (curr.token_in === suiTypename && curr.action === "Swap") {
        acc += Number(curr.amount_in);
      }
      return acc;
    }, 0) ?? 0;
  const swapReceived =
    fund?.trader_operation?.reduce((acc, curr) => {
      if (curr.token_out === suiTypename && curr.action === "Swap") {
        acc += Number(curr.amount_out);
      }
      return acc;
    }, 0) ?? 0;

  return Response.json({
    sui: getDisplayValue(
      (Number(swapPaid) - Number(swapReceived)).toString(),
      9,
    ),
  });
}
