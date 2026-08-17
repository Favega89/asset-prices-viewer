import yahooFinanceApiConstants from "../../_constants/yahooFinanceApiConstants.json" with { type: "json" };
import { getYahooSimpleUsdPrices } from "../../api/yahooFinanceApi.js";
import type { UsdBySymbol } from "../../model/asset.js";
import {
  mapSymbolsToVendorKeys,
  mapVendorPricesToUsdBySymbol,
} from "./utils/marketPriceMappersHelper.js";

const tickerBySymbol: Record<string, string> =
  yahooFinanceApiConstants.tickerBySymbol;

function readErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Public entry: translate symbols → call API → return USD prices by ticker.
export async function getYahooUsdBySymbolCollection(
  symbols: string[],
): Promise<UsdBySymbol> {
  try {
    const yahooTickers = mapSymbolsToVendorKeys(symbols, tickerBySymbol);
    const simplePriceResponse = await getYahooSimpleUsdPrices(yahooTickers);

    return mapVendorPricesToUsdBySymbol(
      simplePriceResponse,
      symbols,
      tickerBySymbol,
    );
  } catch (error) {
    console.error(
      `${yahooFinanceApiConstants.label} price fetch failed; continuing without it: ${readErrorMessage(error)}`,
    );
    return {};
  }
}
