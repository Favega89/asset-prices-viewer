import notionApiConstants from "../../_constants/notionApiConstants.json" with { type: "json" };
import {
  patchNotionAsset,
  postNotionAssetQuery,
} from "../../api/notionAssetsApi.js";
import type { NotionPage } from "../../model/notionProperties.js";
import type { Asset, UsdBySymbol } from "../../model/asset.js";
import {
  getNotionNumber,
  getNotionProperty,
  getNotionSelectName,
  getNotionTitleText,
} from "./utils/notionHelper.js";

const { propertyNames } = notionApiConstants;
const PRICE_CHANGE_EPSILON = 1e-8;

function getAssetFromNotionPage(notionPage: NotionPage): Asset {
  const { properties } = notionPage;
  const notionPrice = getNotionNumber(
    getNotionProperty(properties, propertyNames.price),
  );

  return {
    pageId: notionPage.id,
    symbol: getNotionTitleText(
      getNotionProperty(properties, propertyNames.symbol),
    ),
    assetType: getNotionSelectName(
      getNotionProperty(properties, propertyNames.type),
    ),
    priceSource: getNotionSelectName(
      getNotionProperty(properties, propertyNames.source),
    ),
    price: notionPrice,
    previousPrice: notionPrice,
    cedearRatio: getNotionNumber(
      getNotionProperty(properties, propertyNames.cedearRatio),
    ),
  };
}

function getAssetsFromNotionPages(notionPages: NotionPage[]): Asset[] {
  const assets: Asset[] = [];

  for (const notionPage of notionPages) {
    const asset = getAssetFromNotionPage(notionPage);
    if (asset.symbol) {
      assets.push(asset);
    }
  }

  return assets;
}

// True when there is a new price different from the one last read from Notion.
function hasAssetPriceChanged(asset: Asset): boolean {
  if (asset.price == null) {
    return false;
  }

  if (asset.previousPrice == null) {
    return true;
  }

  return Math.abs(asset.price - asset.previousPrice) > PRICE_CHANGE_EPSILON;
}

export async function getNotionAssets(
  integrationToken: string,
  dataSourceId: string,
): Promise<Asset[]> {
  const notionPages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const response = await postNotionAssetQuery(
      integrationToken,
      dataSourceId,
      startCursor,
    );
    notionPages.push(...response.results);
    startCursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (startCursor);

  return getAssetsFromNotionPages(notionPages);
}

// Divides Yahoo USD quotes by each asset's CEDEAR ratio when present.
export function convertAssetsTroughCedearRatio(
  yahooUsdBySymbol: UsdBySymbol,
  assets: Asset[],
): UsdBySymbol {
  const cedearRatioBySymbol: Record<string, number | null> = {};

  for (const asset of assets) {
    cedearRatioBySymbol[asset.symbol] = asset.cedearRatio;
  }

  const convertedUsdBySymbol: UsdBySymbol = {};

  for (const [symbol, usdPrice] of Object.entries(yahooUsdBySymbol)) {
    const cedearRatio = cedearRatioBySymbol[symbol];

    if (cedearRatio == null || cedearRatio === 0) {
      convertedUsdBySymbol[symbol] = usdPrice;
      continue;
    }

    convertedUsdBySymbol[symbol] = usdPrice / cedearRatio;
  }

  return convertedUsdBySymbol;
}

// Writes Price when it changed; always refreshes Last updated on a fresh vendor quote.
export async function writeNotionAssetPrices(
  integrationToken: string,
  assets: Asset[],
  usdBySymbol: UsdBySymbol,
): Promise<void> {
  const syncedAt = new Date().toISOString();

  for (const asset of assets) {
    if (usdBySymbol[asset.symbol] == null) {
      continue;
    }

    const properties: Record<string, unknown> = {
      [propertyNames.lastUpdated]: {
        date: { start: syncedAt },
      },
    };

    if (hasAssetPriceChanged(asset)) {
      properties[propertyNames.price] = { number: asset.price };
    }

    await patchNotionAsset(integrationToken, asset.pageId, properties);
  }
}
