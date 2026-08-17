import coinGeckoApiConstants from "../_constants/coinGeckoApiConstants.json" with { type: "json" };
import { getCoinGeckoHeaders } from "./utils/headerBuilder.js";
import { getJson } from "./utils/restfulApi.js";

export type CoinGeckoSimplePriceResponse = Record<string, { usd?: number }>;

export async function getCoinGeckoSimpleUsdPrices(
  coinGeckoIds: string[],
  coinGeckoApiKey: string | null,
): Promise<CoinGeckoSimplePriceResponse> {
  if (coinGeckoIds.length === 0) {
    return {};
  }

  const requestUrl = new URL(coinGeckoApiConstants.simplePriceUrl);
  requestUrl.searchParams.set("ids", coinGeckoIds.join(","));
  requestUrl.searchParams.set("vs_currencies", "usd");

  return getJson<CoinGeckoSimplePriceResponse>(
    requestUrl,
    getCoinGeckoHeaders(coinGeckoApiKey),
    coinGeckoApiConstants.label,
  );
}
