import { HermesClient } from "@pythnetwork/hermes-client";

import { CetusClmmSDK, TickMath } from "@cetusprotocol/cetus-sui-clmm-sdk";

import { BN } from "bn.js";
import { PRICE_FEE } from "@/constant/price";

const SUI_DECIMAL = 9;

const mainnet = {
  fullRpcUrl:
    process.env.NEXT_PUBLIC_SUI_NETWORK_URL ??
    "https://fullnode.mainnet.sui.io:443",
  swapCountUrl: "https://api-sui.cetus.zone/v2/sui/pools_info",
  simulationAccount: {
    address:
      "0x39dfa26ecaf49a466cfe33b2e98de9b46425eec170e59eb40d3f69d061a67778",
  },
  cetus_config: {
    package_id:
      "0x95b8d278b876cae22206131fb9724f701c9444515813042f54f0a426c9a3bc2f",
    published_at:
      "0x95b8d278b876cae22206131fb9724f701c9444515813042f54f0a426c9a3bc2f",
    config: {
      coin_list_id:
        "0x8cbc11d9e10140db3d230f50b4d30e9b721201c0083615441707ffec1ef77b23",
      launchpad_pools_id:
        "0x1098fac992eab3a0ab7acf15bb654fc1cf29b5a6142c4ef1058e6c408dd15115",
      clmm_pools_id:
        "0x15b6a27dd9ae03eb455aba03b39e29aad74abd3757b8e18c0755651b2ae5b71e",
      admin_cap_id:
        "0x39d78781750e193ce35c45ff32c6c0c3f2941fa3ddaf8595c90c555589ddb113",
      global_config_id:
        "0x0408fa4e4a4c03cc0de8f23d0c2bbfe8913d178713c9a271ed4080973fe42d8f",
      coin_list_handle:
        "0x49136005e90e28c4695419ed4194cc240603f1ea8eb84e62275eaff088a71063",
      launchpad_pools_handle:
        "0x5e194a8efcf653830daf85a85b52e3ae8f65dc39481d54b2382acda25068375c",
      clmm_pools_handle:
        "0x37f60eb2d9d227949b95da8fea810db3c32d1e1fa8ed87434fc51664f87d83cb",
    },
  },
  clmm_pool: {
    package_id:
      "0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb",
    published_at:
      "0x70968826ad1b4ba895753f634b0aea68d0672908ca1075a2abdf0fc9e0b2fc6a",
    config: {
      pools_id:
        "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
      global_config_id:
        "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
      global_vault_id:
        "0xce7bceef26d3ad1f6d9b6f13a953f053e6ed3ca77907516481ce99ae8e588f2b",
      admin_cap_id:
        "0x89c1a321291d15ddae5a086c9abc533dff697fde3d89e0ca836c41af73e36a75",
      partners_id:
        "0xac30897fa61ab442f6bff518c5923faa1123c94b36bd4558910e9c783adfa204",
    },
  },
  integrate: {
    package_id:
      "0x996c4d9480708fb8b92aa7acf819fb0497b5ec8e65ba06601cae2fb6db3312c3",
    published_at:
      "0x6f5e582ede61fe5395b50c4a449ec11479a54d7ff8e0158247adfda60d98970b",
  },
  deepbook: {
    package_id:
      "0x000000000000000000000000000000000000000000000000000000000000dee9",
    published_at:
      "0x000000000000000000000000000000000000000000000000000000000000dee9",
  },
  deepbook_endpoint_v2: {
    package_id:
      "0x0dd416959739e1db3a4c6f9cac7f9e7202678f3b067d6d419e569a124fc35e0e",
    published_at:
      "0x0dd416959739e1db3a4c6f9cac7f9e7202678f3b067d6d419e569a124fc35e0e",
  },
  aggregatorUrl: "https://api-sui.cetus.zone/router",
};
export class Quoter {
  connection: HermesClient;
  MainnetSDK: CetusClmmSDK;

  constructor() {
    this.connection = new HermesClient("https://hermes.pyth.network", {});
    this.MainnetSDK = new CetusClmmSDK(mainnet);
  }

  async getPoolDetail(poolAddress: string) {
    const poolDetail = await this.MainnetSDK.Pool.getPool(poolAddress);
    return poolDetail;
  }

  async pythPriceEstimate(cryptoPriceFee: string) {
    const priceUpdates = await this.connection.getLatestPriceUpdates([
      cryptoPriceFee,
    ]);

    if (priceUpdates["parsed"] && priceUpdates["parsed"].length > 0) {
      const exponent = Math.abs(priceUpdates["parsed"][0]["price"]["expo"]);
      const decimals = Math.pow(10, exponent);
      const price =
        Number(priceUpdates["parsed"][0]["price"]["price"]) / decimals;
      return price;
    } else {
      console.error("priceUpdates['parsed'] is null or undefined or empty");
    }
  }

  async cetusPriceEstimateForSui(poolAddress: string, decimalA: number) {
    const pool = await this.getPoolDetail(poolAddress);
    const price = TickMath.sqrtPriceX64ToPrice(
      new BN(pool.current_sqrt_price),
      decimalA,
      SUI_DECIMAL,
    );

    return price.toNumber();
  }

  async quote(
    inputCoinIndex: number,
    outputCoinIndex: number,
    amount: number,
    type: "in" | "out",
  ) {
    let coinAAmount;
    let coinBAmount;
    const SUIUSD = await this.pythPriceEstimate(PRICE_FEE[10].priceFeeId);

    if (inputCoinIndex == 10) {
      coinAAmount = 1 * SUIUSD!;
    } else if (inputCoinIndex < 12) {
      const coinAUSD = await this.pythPriceEstimate(
        PRICE_FEE[inputCoinIndex].priceFeeId,
      );
      coinAAmount = coinAUSD;
      // const SUIUSD = await this.pythPriceEstimate(PRICE_FEE[10].priceFeeId);
      // coinAAmount = coinAUSD! / SUIUSD!;
    } else {
      coinAAmount =
        (await this.cetusPriceEstimateForSui(
          PRICE_FEE[inputCoinIndex].priceFeeId,
          PRICE_FEE[inputCoinIndex].decimal,
        )) * SUIUSD!;
    }

    if (outputCoinIndex == 10) {
      coinBAmount = 1 * SUIUSD!;
    } else if (outputCoinIndex < 12) {
      const coinBUSD = await this.pythPriceEstimate(
        PRICE_FEE[outputCoinIndex].priceFeeId,
      );
      coinBAmount = coinBUSD;
      // const SUIUSD = await this.pythPriceEstimate(PRICE_FEE[10].priceFeeId);
      // coinBAmount = coinBUSD! / SUIUSD!;
    } else {
      coinBAmount =
        (await this.cetusPriceEstimateForSui(
          PRICE_FEE[outputCoinIndex].priceFeeId,
          PRICE_FEE[outputCoinIndex].decimal,
        )) * SUIUSD!;
    }

    const price =
      type === "in"
        ? (coinAAmount! / coinBAmount!) * amount
        : (coinBAmount! / coinAAmount!) * amount;

    return price;
  }
}
