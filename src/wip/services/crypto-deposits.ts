import { request } from './base'

interface TransportAddressWithFormat {
  addressType: 'ADDRESS' | 'LEGACY_ADDRESS'
  address: string
  tag: string
}

interface WalletAddressResponse {
  addresses: TransportAddressWithFormat[]
}

const getCryptoAddressForAsset = (assetId: string, networkId: string): Promise<WalletAddressResponse> =>
  request({
    url: `/public/v4/crypto/deposits/${networkId}/${assetId}/address`,
    method: 'GET',
  })

export const CryptoDepositsServices = {
  getCryptoAddressForAsset,
}
