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

    return fetch(requestUrl, {
      method: "GET",
      credentials: "include",
    });
  }

  async postRequest(url: string, body: Record<string, unknown>) {
    return fetch(`${this.apiUrl}${url}`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(body),
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
    searchText,
    owner,
  }: {
    types: string[];
    orderBy?: string;
    order?: "asc" | "desc";
    searchText?: string;
    owner?: string;
  }) {
    const funds = await this.getRequest("/pool", {
      types,
      order,
      orderBy,
      searchText,
      owner,
    });
    return funds;
  }

  async getPoolBalance({ fundId }: { fundId: string }) {
    const funds = await this.getRequest(`/pool-balance/statistics`, {
      fundId,
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

  async postAuth({
    message,
    signature,
  }: {
    message: string;
    signature: string;
  }) {
    const response = await fetch(`${this.apiUrl}/user/auth`, {
      method: "POST",
      body: JSON.stringify({
        message,
        signature,
      }),
    });
    return response;
  }

  async postUserInfo({ name }: { name?: string }) {
    const response = await this.postRequest("/user/info", {
      name,
    });
    return response;
  }

  async postUserAvatar({ image }: { image: Buffer }) {
    const response = await this.postRequest("/user/avatar", {
      image,
    });
    return response;
  }

  async GetUser({ address }: { address: string }) {
    const response = await this.getRequest(`/user`, {
      address,
    });
    return response;
  }
}

export const stingrayClient = new StingrayClient();
