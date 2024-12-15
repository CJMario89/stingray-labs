import { getSuiService } from "@/common";

export async function POST(req: Request) {
  const body = await req.json();
  const suiService = getSuiService();
  await suiService.upsertWithdrawEvents({
    protocol: body,
  });
  return Response.json({});
}
