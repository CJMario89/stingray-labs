import { prisma } from "@/prisma";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fundId = url.searchParams.get("fundId");
  if (!fundId) {
    return Response.error();
  }
  const fundHistory =
    (await prisma.fund_history.findMany({
      where: {
        fund_object_id: fundId,
      },
      orderBy: {
        timestamp: "asc",
      },
    })) ?? [];
  return Response.json(fundHistory);
}
