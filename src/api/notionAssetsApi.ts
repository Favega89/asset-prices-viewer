import notionApiConstants from "../_constants/notionApiConstants.json" with { type: "json" };
import type { NotionPage } from "../model/notionProperties.js";
import { getNotionHeaders } from "./utils/headerBuilder.js";
import { patchJson, postJson } from "./utils/restfulApi.js";

const QUERY_PAGE_SIZE = 100;

export interface NotionAssetQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

export async function postNotionAssetQuery(
  integrationToken: string,
  dataSourceId: string,
  startCursor?: string,
): Promise<NotionAssetQueryResponse> {
  return postJson<NotionAssetQueryResponse>(
    `${notionApiConstants.apiBaseUrl}/data_sources/${dataSourceId}/query`,
    {
      page_size: QUERY_PAGE_SIZE,
      ...(startCursor ? { start_cursor: startCursor } : {}),
    },
    getNotionHeaders(integrationToken),
    notionApiConstants.label,
  );
}

export async function patchNotionAsset(
  integrationToken: string,
  pageId: string,
  properties: Record<string, unknown>,
): Promise<unknown> {
  return patchJson(
    `${notionApiConstants.apiBaseUrl}/pages/${pageId}`,
    { properties },
    getNotionHeaders(integrationToken),
    notionApiConstants.label,
  );
}
