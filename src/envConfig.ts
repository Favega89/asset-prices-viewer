const REQUIRED_ENV_VAR_NAMES = [
  "NOTION_TOKEN",
  "NOTION_PRICES_DATA_SOURCE_ID",
] as const;

export interface EnvConfig {
  notionToken: string;
  pricesDataSourceId: string;
  coinGeckoApiKey: string | null;
}

function getRequiredEnvVar(envVarName: string): string {
  const value = process.env[envVarName]?.trim();

  if (!value) {
    throw new Error(`Missing required env var: ${envVarName}`);
  }

  return value;
}

export function loadEnvConfig(): EnvConfig {
  const missingEnvVarNames = REQUIRED_ENV_VAR_NAMES.filter(
    (envVarName) => !process.env[envVarName]?.trim(),
  );

  if (missingEnvVarNames.length > 0) {
    console.error(
      `Missing required env var(s): ${missingEnvVarNames.join(", ")}`,
    );
    console.error("Copy .env.example to .env and fill in the values.");
    process.exit(1);
  }

  const pricesDataSourceId = getRequiredEnvVar(
    "NOTION_PRICES_DATA_SOURCE_ID",
  );

  if (
    pricesDataSourceId.includes("http") ||
    pricesDataSourceId.includes("notion.com")
  ) {
    console.error(
      "NOTION_PRICES_DATA_SOURCE_ID must be a UUID, not the Notion page URL.",
    );
    console.error(
      "Use the data source id (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx), not Copy link.",
    );
    process.exit(1);
  }

  return {
    notionToken: getRequiredEnvVar("NOTION_TOKEN"),
    pricesDataSourceId,
    coinGeckoApiKey: process.env.COINGECKO_API_KEY?.trim() || null,
  };
}
