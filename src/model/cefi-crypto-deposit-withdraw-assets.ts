import { createEffect, createEvent, createStore, sample } from 'effector'

import { AssetsServices, AssetWithNetworks } from '../wip/services'

// Мок-данные для fallback
const mockCryptoDepositWithdrawAssets: AssetWithNetworks[] = [
  {
    assetId: 'BTC',
    networks: [
      {
        networkId: 'BTC',
        minimumDepositAmount: '0.001',
        minimumWithdrawalAmount: '0.002',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: false,
      },
    ],
  },
  {
    assetId: 'ETH',
    networks: [
      {
        networkId: 'ETH',
        minimumDepositAmount: '0.01',
        minimumWithdrawalAmount: '0.02',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: false,
      },
      {
        networkId: 'BNB',
        minimumDepositAmount: '0.01',
        minimumWithdrawalAmount: '0.02',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: false,
      },
    ],
  },
  {
    assetId: 'USDT',
    networks: [
      {
        networkId: 'ETH',
        minimumDepositAmount: '10.0',
        minimumWithdrawalAmount: '20.0',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: false,
      },
      {
        networkId: 'TRX',
        minimumDepositAmount: '10.0',
        minimumWithdrawalAmount: '20.0',
        depositAvailable: true,
        withdrawalAvailable: true,
        tagsSupported: true,
      },
    ],
  },
]

export const $cefiCryptoDepositWithdrawAssets = createStore<AssetWithNetworks[]>(mockCryptoDepositWithdrawAssets)
export const $cefiCryptoDepositWithdrawAssetsError = createStore<Error | null>(null)
export const cefiCryptoDepositWithdrawAssetsEv = createEvent<AssetWithNetworks[]>()

export const cefiCryptoDepositWithdrawAssetsFx = createEffect(async () => {
  const list = await mockCryptoDepositWithdrawAssets // AssetsServices.getCryptoDepositWithdrawal()
  return list
})

// Обновление store при успешном запросе
$cefiCryptoDepositWithdrawAssets.on(cefiCryptoDepositWithdrawAssetsFx.doneData, (_, repos) => repos)

// Обработка ошибок: устанавливаем мок-данные и сохраняем ошибку
sample({
  clock: cefiCryptoDepositWithdrawAssetsFx.failData,
  fn: (error: Error) => {
    console.error('Error fetching crypto deposit/withdrawal assets:', error)
    return error
  },
  target: $cefiCryptoDepositWithdrawAssetsError,
})

// Установка мок-данных при ошибке
sample({
  clock: cefiCryptoDepositWithdrawAssetsFx.failData,
  fn: () => mockCryptoDepositWithdrawAssets,
  target: $cefiCryptoDepositWithdrawAssets,
})

// Сброс ошибки при успешном запросе
$cefiCryptoDepositWithdrawAssetsError.on(cefiCryptoDepositWithdrawAssetsFx.doneData, () => null)

// Ручное обновление через событие
$cefiCryptoDepositWithdrawAssets.on(cefiCryptoDepositWithdrawAssetsEv, (_, p) => p)
