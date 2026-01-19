import { CombinedObject } from 'model/cefi-combain-assets-data'

export function getPriorityAssets(assets: CombinedObject[]) {
  const result = new Set<CombinedObject>()
  const priorityAssets = ['PAIRS', 'BTC', 'ETH', 'USDT']
  const assetDisplayLimit = 3 // The number of displayed assets on the dashboard

  const addAssetsToResult = (filteredAssets: CombinedObject[]) => {
    for (const asset of filteredAssets) {
      if (result.size < assetDisplayLimit) {
        result.add(asset)
      }
    }
  }

  // Step 1: Add assetId === 'PAIRS'
  addAssetsToResult(assets.filter(asset => asset.assetId === 'PAIRS'))

  // Step 2: Add isFavourite === true, sorted by descending availableBalance
  addAssetsToResult(
    assets
      .filter(asset => asset.isFavourite && !result.has(asset))
      .sort((a, b) => b.availableBalance - a.availableBalance)
  )

  // Step 3: Add by availableBalance, unique
  addAssetsToResult(assets.filter(asset => !result.has(asset)).sort((a, b) => b.availableBalance - a.availableBalance))

  // Step 4: Add priority assetIds
  addAssetsToResult(assets.filter(asset => priorityAssets.includes(asset.assetId) && !result.has(asset)))

  // Step 5: Add remaining assets if needed
  addAssetsToResult(assets.filter(asset => !result.has(asset)))

  return Array.from(result).slice(0, 3)
}
