import { CronJob } from "cron";
import { getFullnodeUrl } from "@mysten/sui/client";
import dotenv from "dotenv";
import { SuiService } from "../service";

dotenv.config({
  path: "../.env",
});

const rpcUrl = getFullnodeUrl("mainnet");

const job = CronJob.from({
  cronTime: "*/5 * * * * *",
  onTick: async function () {
    const suiService = new SuiService({
      url: process.env.NEXT_PUBLIC_SUI_NETWORK_URL ?? rpcUrl,
    });

    await suiService.upsertInvestedEvents();
    await suiService.upsertDeinvestedEvents();
    // await suiService.upsertMergeShareEvents();
  },
  start: true,
  timeZone: "America/Los_Angeles",
});

job.start();
