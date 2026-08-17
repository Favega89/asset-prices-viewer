export interface Asset {
  pageId: string;
  symbol: string;
  assetType: string | null;
  priceSource: string | null;
  price: number | null;
  previousPrice: number | null;
  cedearRatio: number | null;
}

export type UsdBySymbol = Record<string, number>;
