export interface NotionRichText {
  plain_text: string;
}

export interface NotionProperty {
  title?: NotionRichText[];
  select?: { name: string } | null;
  number?: number | null;
}

export type NotionProperties = Record<string, NotionProperty>;

export interface NotionPage {
  object: "page";
  id: string;
  properties: NotionProperties;
}
