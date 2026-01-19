import { $assetsListData } from 'model/cefi-combain-assets-data'

import AssetsIcons from '../constant/assetsIcon'

const DEFAULT_ICON = 'https://coin-images.coingecko.com/coins/images/33758/large/Fideum-token.png'
const BSC_ICON = 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
const BASE_ICON = 'https://assets.coingecko.com/asset_platforms/images/131/large/base-network.png'
//TODO подумать над кэшированием

export const getNetworkIcon = (networkId: string): string => {
  const assets = $assetsListData.getState()

  const availableNetworks = [
    ...new Set(
      assets
        .map(asset => asset.networksInfo)
        .flat()
        .map(network => network.networkId)
    ),
  ]

  const networkIcons = availableNetworks.reduce(
    (acc, network) => {
      const icon =
        assets.find(item => item.assetId === network)?.icon || AssetsIcons[network?.toLowerCase()] || DEFAULT_ICON

      if (network === 'BSC') {
        return { ...acc, [network]: BSC_ICON }
      }
      if (network === 'BASE') {
        return { ...acc, [network]: BASE_ICON }
      }
      return { ...acc, [network]: icon }
    },
    {} as Record<string, string>
  )

  return networkIcons[networkId] || AssetsIcons[networkId?.toLowerCase()] || DEFAULT_ICON
}
