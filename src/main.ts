import "dotenv/config";
import { syncPrices } from "./controller/syncController.js";

async function main(): Promise<void> {
  const assets = await syncPrices();

  console.log(`Sync OK — ${assets.length} asset(s).`);
  for (const asset of assets.sort((a, b) => a.symbol.localeCompare(b.symbol))) {
    const priceLabel =
      asset.price == null ? "(empty)" : asset.price.toLocaleString("en-US");
    console.log(
      `- ${asset.symbol} | ${asset.assetType ?? "?"} | ${asset.priceSource ?? "?"} | ${priceLabel}`,
    );
  }
}

main().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("Application failed:", errorMessage);
  process.exit(1);
});
