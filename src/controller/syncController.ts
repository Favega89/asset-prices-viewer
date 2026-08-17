import { getCoinGeckoUsdBySymbolCollection } from "./managers/coinGeckoManager.js";
import {
  convertAssetsTroughCedearRatio,
  getNotionAssets,
  writeNotionAssetPrices,
} from "./managers/notionAssetManager.js";
import { getYahooUsdBySymbolCollection } from "./managers/yahooFinanceManager.js";
import { loadEnvConfig } from "../envConfig.js";
import type { Asset, UsdBySymbol } from "../model/asset.js";

function getSymbolsBySource(assets: Asset[], priceSource: string): string[] {
  const symbols: string[] = [];

  for (const asset of assets) {
    if (asset.priceSource === priceSource) {
      symbols.push(asset.symbol);
    }
  }

  return symbols;
}

// Copies each vendor USD quote onto the matching Notion asset's price field.
function applyUsdPrices(assets: Asset[], usdBySymbol: UsdBySymbol): Asset[] {
  return assets.map((asset) => {
    const usdPrice = usdBySymbol[asset.symbol];
    if (usdPrice == null) {
      return asset;
    }

    return { ...asset, price: usdPrice };
  });
}

async function getYahooUsdConvertedThroughCedearRatio(
  assets: Asset[],
): Promise<UsdBySymbol> {
  const yahooUsdBySymbol = await getYahooUsdBySymbolCollection(
    getSymbolsBySource(assets, "Yahoo"),
  );

  return convertAssetsTroughCedearRatio(yahooUsdBySymbol, assets);
}

export async function syncPrices(): Promise<Asset[]> {
  const envConfig = loadEnvConfig();
  const notionAssets = await getNotionAssets(
    envConfig.notionToken,
    envConfig.pricesDataSourceId,
  );

  const [coinGeckoUsdBySymbol, yahooUsdBySymbol] = await Promise.all([
    getCoinGeckoUsdBySymbolCollection(
      getSymbolsBySource(notionAssets, "CoinGecko"),
      envConfig.coinGeckoApiKey,
    ),
    getYahooUsdConvertedThroughCedearRatio(notionAssets),
  ]);

  const assets = applyUsdPrices(notionAssets, {
    ...coinGeckoUsdBySymbol,
    ...yahooUsdBySymbol,
  });

  await writeNotionAssetPrices(envConfig.notionToken, assets);

  return assets;
}
