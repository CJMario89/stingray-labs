import { getSuiService } from "@/common";

export async function POST() {
  const suiService = getSuiService();
  await suiService.upsertInvestedEvents();
  return Response.json({});
}
