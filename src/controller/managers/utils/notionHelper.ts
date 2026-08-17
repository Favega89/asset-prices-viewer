import type {
  NotionProperties,
  NotionProperty,
} from "../../../model/notionProperties.js";

export function getNotionProperty(
  properties: NotionProperties,
  propertyName: string,
): NotionProperty | undefined {
  return properties[propertyName];
}

export function getNotionTitleText(property?: NotionProperty): string {
  return (property?.title ?? []).map((item) => item.plain_text).join("");
}

export function getNotionSelectName(property?: NotionProperty): string | null {
  return property?.select?.name ?? null;
}

export function getNotionNumber(property?: NotionProperty): number | null {
  return property?.number ?? null;
}
