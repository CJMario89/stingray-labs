import { getSuiService } from "@/common";

export async function POST() {
  const suiService = getSuiService();
  await suiService.upsertSwapEvents();
  return Response.json({});
}
