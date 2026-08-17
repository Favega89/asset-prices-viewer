import type { UsdBySymbol } from "../../../model/asset.js";

export type VendorSimplePriceResponse = Record<string, { usd?: number }>;

// Maps our tickers (BTC, AAPL) to vendor keys (bitcoin, AAPL) via a local lookup table.
export function mapSymbolsToVendorKeys(
  symbols: string[],
  keyBySymbol: Record<string, string>,
): string[] {
  const vendorKeys: string[] = [];

  for (const symbol of symbols) {
    const vendorKey = keyBySymbol[symbol];
    if (vendorKey) {
      vendorKeys.push(vendorKey);
    }
  }

  return [...new Set(vendorKeys)];
}

// Turns a vendor key→usd payload into our symbol→usd map using the same lookup table.
export function mapVendorPricesToUsdBySymbol(
  simplePriceResponse: VendorSimplePriceResponse,
  symbols: string[],
  keyBySymbol: Record<string, string>,
): UsdBySymbol {
  const usdBySymbol: UsdBySymbol = {};

  for (const symbol of symbols) {
    const vendorKey = keyBySymbol[symbol];
    const usdPrice = vendorKey
      ? simplePriceResponse[vendorKey]?.usd
      : undefined;

    if (usdPrice != null) {
      usdBySymbol[symbol] = usdPrice;
    }
  }

  return usdBySymbol;
}
