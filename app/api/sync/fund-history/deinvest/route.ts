import { getSuiService } from "@/common";

export async function POST() {
  const suiService = getSuiService();
  await suiService.upsertDeinvestedEvents();
  // await suiService.upsertMergeShareEvents();
  return Response.json({});
}
