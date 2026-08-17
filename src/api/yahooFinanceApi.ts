import yahooFinanceApiConstants from "../_constants/yahooFinanceApiConstants.json" with { type: "json" };
import { getYahooHeaders } from "./utils/headerBuilder.js";
import { getJson } from "./utils/restfulApi.js";

export type YahooSimplePriceResponse = Record<string, { usd?: number }>;

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        regularMarketPrice?: number;
      };
    }> | null;
  };
}

async function getYahooChartUsdPrice(
  yahooTicker: string,
): Promise<{ symbol: string; usd: number } | null> {
  const requestUrl = new URL(
    `${yahooFinanceApiConstants.chartBaseUrl}/${yahooTicker}`,
  );
  requestUrl.searchParams.set("interval", "1d");
  requestUrl.searchParams.set("range", "1d");

  const chartResponse = await getJson<YahooChartResponse>(
    requestUrl,
    getYahooHeaders(),
    yahooFinanceApiConstants.label,
  );
  const meta = chartResponse.chart?.result?.[0]?.meta;

  if (meta?.symbol == null || meta.regularMarketPrice == null) {
    return null;
  }

  return { symbol: meta.symbol, usd: meta.regularMarketPrice };
}

export async function getYahooSimpleUsdPrices(
  yahooTickers: string[],
): Promise<YahooSimplePriceResponse> {
  if (yahooTickers.length === 0) {
    return {};
  }

  const quoteResults = await Promise.all(
    yahooTickers.map((yahooTicker) => getYahooChartUsdPrice(yahooTicker)),
  );
  const usdByTicker: YahooSimplePriceResponse = {};

  for (const quote of quoteResults) {
    if (!quote) {
      continue;
    }

    usdByTicker[quote.symbol] = { usd: quote.usd };
  }

  return usdByTicker;
}
