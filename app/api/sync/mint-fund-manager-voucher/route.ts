import { getSuiService } from "@/common";

export async function POST() {
  const suiService = getSuiService();
  await suiService.upsertMintFundManagerVoucherEvents();
  return Response.json({});
}
