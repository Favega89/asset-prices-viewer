import notionApiConstants from "../../_constants/notionApiConstants.json" with { type: "json" };

type RequestHeaders = Record<string, string>;

export function getNotionHeaders(integrationToken: string): RequestHeaders {
  return {
    authorization: `Bearer ${integrationToken}`,
    "notion-version": notionApiConstants.apiVersion,
  };
}

export function getCoinGeckoHeaders(
  coinGeckoApiKey: string | null,
): RequestHeaders {
  const headers: RequestHeaders = { accept: "application/json" };

  if (coinGeckoApiKey) {
    headers["x-cg-demo-api-key"] = coinGeckoApiKey;
  }

  return headers;
}

export function getYahooHeaders(): RequestHeaders {
  return {
    accept: "application/json",
    "user-agent":
      "Mozilla/5.0 (compatible; asset-prices-viewer/0.1; +https://github.com/local)",
  };
}
