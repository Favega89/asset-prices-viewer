import coinGeckoApiConstants from "../../_constants/coinGeckoApiConstants.json" with { type: "json" };
import { getCoinGeckoSimpleUsdPrices } from "../../api/coinGeckoApi.js";
import type { UsdBySymbol } from "../../model/asset.js";
import {
  mapSymbolsToVendorKeys,
  mapVendorPricesToUsdBySymbol,
} from "./utils/marketPriceMappersHelper.js";

const idBySymbol: Record<string, string> = coinGeckoApiConstants.idBySymbol;

function readErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Public entry: translate symbols → call API → return USD prices by ticker.
export async function getCoinGeckoUsdBySymbolCollection(
  symbols: string[],
  coinGeckoApiKey: string | null,
): Promise<UsdBySymbol> {
  try {
    const coinGeckoIds = mapSymbolsToVendorKeys(symbols, idBySymbol);
    const simplePriceResponse = await getCoinGeckoSimpleUsdPrices(
      coinGeckoIds,
      coinGeckoApiKey,
    );

    return mapVendorPricesToUsdBySymbol(
      simplePriceResponse,
      symbols,
      idBySymbol,
    );
  } catch (error) {
    console.error(
      `${coinGeckoApiConstants.label} price fetch failed; continuing without it: ${readErrorMessage(error)}`,
    );
    return {};
  }
}
