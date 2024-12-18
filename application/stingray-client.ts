import { TradeDuration } from "@/type";
import qs from "qs";

export class StingrayClient {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getRequest(url: string, params?: any) {
    const queryString = qs.stringify(params, {
      arrayFormat: "repeat",
      encode: true,
    });

    const requestUrl =
      queryString.length === 0
        ? `${this.apiUrl}${url}`
        : `${this.apiUrl}${url}?${queryString}`;
    console.log("requestUrl", requestUrl);
    return fetch(requestUrl, {
      method: "GET",
      credentials: "include",
    });
  }
  async getArenaInfo() {
    const arenas = await this.getRequest("/arena/info");
    return arenas;
  }

  async getPools({
    types,
    order,
    orderBy,
  }: {
    types: string[];
    orderBy?: string;
    order?: "asc" | "desc";
  }) {
    const funds = await this.getRequest("/pool/all", { types, order, orderBy });
    return funds;
  }

  async getPoolArenas({ duration }: { duration: TradeDuration }) {
    const funds = await this.getRequest("/pool/arenas", {
      duration,
    });
    return funds;
  }

  async getPoolFundings({ duration }: { duration: TradeDuration }) {
    const funds = await this.getRequest("/pool/fundings", {
      duration,
    });
    return funds;
  }

  async getPoolRunningFunds({ duration }: { duration: TradeDuration }) {
    const funds = await this.getRequest("/pool/runnings", {
      duration,
    });
    return funds;
  }

  async getInvestedFundings({ duration }: { duration: TradeDuration }) {
    const funds = await this.getRequest("/invested/fundings", {
      duration,
    });
    return funds;
  }

  async getInvestedRunnings({ duration }: { duration: TradeDuration }) {
    const funds = await this.getRequest("/invested/runnings", {
      duration,
    });
    return funds;
  }

  async getInvestedClaimables({ duration }: { duration: TradeDuration }) {
    const funds = await this.getRequest("/invested/claimables", {
      duration,
    });
    return funds;
  }

  async getFundHistory({ fundId }: { fundId: string }) {
    const funds = await this.getRequest(`/fund/history/${fundId}`);
    return funds;
  }
}

export const stingrayClient = new StingrayClient();
