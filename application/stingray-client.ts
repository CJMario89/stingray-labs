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

  async getPools({
    types,
    order,
    orderBy,
    searchText,
    owner,
    investor,
  }: {
    types: string[];
    orderBy?: string;
    order?: "asc" | "desc";
    searchText?: string;
    owner?: string;
    investor?: string;
  }) {
    const funds = await this.getRequest("/pool", {
      types,
      order,
      orderBy,
      searchText,
      owner,
      investor,
    });
    return funds;
  }

  async getPoolBalance({ fundId }: { fundId: string }) {
    const funds = await this.getRequest(`/pool-balance/statistics`, {
      fundId,
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

  async postUserInfo({
    name,
    image,
    address,
  }: {
    name?: string;
    image?: string;
    address: string;
  }) {
    const response = await this.postRequest("/user/info", {
      name,
      image,
      address,
    });
    return response;
  }

  async GetUser({ address }: { address: string }) {
    const response = await this.getRequest(`/user`, {
      address,
    });
    return response;
  }

  async getSponsorPools() {
    const response = await this.getRequest("/sponsor-pools");
    return response;
  }

  async getPoolPriceHistory({ fundId }: { fundId: string }) {
    const response = await this.getRequest("/pool-price-history", {
      fundId,
    });
    return response;
  }

  async getPreviousPoolPrice({ owner }: { owner: string }) {
    const response = await this.getRequest(
      "/pool-price-history/owned-previous",
      {
        owner,
      },
    );
    return response;
  }

  async getMintedVoucher({
    sponsorPoolId,
    minter,
  }: {
    sponsorPoolId: string;
    minter: string;
  }) {
    const response = await this.getRequest("/sponsor-pools/minted", {
      sponsorPoolId,
      minter,
    });
    return response;
  }

  async getTraderClaim({ fundId }: { fundId: string }) {
    const response = await this.getRequest("/pool/trader-claim", {
      fundId,
    });

    return response;
  }
}

export const stingrayClient = new StingrayClient();
