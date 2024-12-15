import { prisma } from "@/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  console.log("req", req);
  const url = new URL(req.url);
  const fundId = url.searchParams.get("fundId");
  if (!fundId) {
    return Response.error();
  }
  const tokenouts = await prisma.trader_operation.groupBy({
    by: ["token_out"],
    where: {
      fund_object_id: fundId,
    },
  });

  return Response.json(
    tokenouts
      .map((tokenout) => `0x${tokenout.token_out}`)
      .filter(
        (tokenout) =>
          tokenout !==
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI" &&
          tokenout !==
            "0x75b23bde4de9aca930d8c1f1780aa65ee777d8b33c3045b053a178b452222e82::fountain_core::StakeProof<1798f84ee72176114ddbf5525a6d964c5f8ea1b3738d08d50d0d3de4cf584884::sbuck::SBUCK,0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>",
      ),
  );
}
