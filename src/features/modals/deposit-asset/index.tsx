import { ReactElement, useCallback, useEffect, useState } from 'react'

import { CommonDropdown, QRCodeBlock, Spinner } from 'components'
import { EVENT_NAMES, NetworkWithAssetInfo, useAnalytics } from 'wip/services'
import { CryptoDepositsServices } from 'wip/services/crypto-deposits'
import { CheckedIcon } from 'icons'

import { CombinedObject } from '../../../model/cefi-combain-assets-data'
import styles from './styles.module.scss'

export interface DepositAssetModal {
  asset: CombinedObject
}

export function DepositAssetModal({ asset }: DepositAssetModal) {
  const { myLogEvent } = useAnalytics()

  const availableNetworks = asset.networksInfo.filter(networkInfo => networkInfo.depositAvailable)

  const [isLoading, setIsLoading] = useState(true)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkWithAssetInfo | null>(availableNetworks[0] || null)
  const [isCopied, setIsCopied] = useState(false)
  const [depositAddress, setDepositAddress] = useState('')
  const [tag, setTag] = useState('')
  const [errorResponse, setErrorResponse] = useState('')

  const getCoinAddress = useCallback(async () => {
    setErrorResponse('')
    if (!selectedNetwork) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const depositInfo = await CryptoDepositsServices.getCryptoAddressForAsset(
        asset.assetId,
        selectedNetwork.networkId
      )
      //TODO: уточнить структуру
      setDepositAddress(depositInfo.addresses[0].address)
      setTag(depositInfo.addresses[0].tag)
    } catch (error: any) {
      console.log('ERROR-getCoinAddress', error)
      // MOCK: Для внутреннего тестирования и разработки
      const ethAddresses = [
        '0x34aa448f6d580D095DBDF756cf3fFB8FB3eD6e6a',
        '0x4d09D15d0678D9e154e204b0703151D0a13d9806',
        '0xb9700D77a69D760aE9FC0A425D3768fD37aE7de2',
        '0x0098D603C085Bc7d6cA152565fab9F1059eaCc3C',
        '0x2CDf95833387B2555b842a99614f888b3383d3e7',
      ]
      const trxAddresses = ['TTDAKTrVgcZYupxMX455ioKsAX9Q3Ci5tJ', 'TGEFCgHwBHXQQyZsaYv4E8rSshj6HrCAeo']

      const networkId = selectedNetwork.networkId.toUpperCase()
      const addresses = networkId === 'ETH' ? ethAddresses : networkId === 'TRX' ? trxAddresses : []
      console.log('addresses', addresses)
      if (addresses.length > 0) {
        const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
        const mockDepositInfo = {
          addresses: [
            {
              addressType: 'ADDRESS' as const,
              address: randomAddress,
              tag: '',
            },
          ],
        }
        setDepositAddress(mockDepositInfo.addresses[0].address)
        setTag(mockDepositInfo.addresses[0].tag)
      } else {
        setErrorResponse(error.code || error.message)
        setDepositAddress('')
      }
      // Modal.open(<ErrorModalDisplay errorText={error.code || error.message} />, { variant: 'center' })
    }
    setIsLoading(false)
  }, [asset, selectedNetwork])

  useEffect(() => {
    if (selectedNetwork) {
      getCoinAddress().finally(() => {})
    }
  }, [selectedNetwork])

  useEffect(() => {
    if (selectedNetwork && depositAddress) {
      myLogEvent(EVENT_NAMES.WEB_DEPOSIT, {
        asset: asset?.assetId,
        address: depositAddress,
        networkId: selectedNetwork.networkId,
      })
    }
  }, [selectedNetwork])

  const handleCopy = (): void => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 3000)
  }

  const itemComponentAddresses = (selectedItemAddress: NetworkWithAssetInfo): ReactElement => {
    if (!selectedItemAddress) return <div className={styles.bankName}>Choose Network</div>
    return (
      <div>
        <div className={styles.bankName}>{selectedItemAddress?.networkId}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className={styles.title}>Deposit {asset?.assetName}</div>
      <div className={styles.content}>
        {availableNetworks.length > 1 ? (
          <>
            <div className={styles.chooseNetwork}>Choose Network</div>
            <CommonDropdown
              data={availableNetworks}
              itemComponent={itemComponentAddresses}
              setSelectedData={setSelectedNetwork}
              selectedData={selectedNetwork}
            />
          </>
        ) : null}
        {isLoading ? (
          <div style={{ justifyContent: 'center', display: 'flex' }}>
            <Spinner />
          </div>
        ) : (
          <QRCodeBlock
            stringCode={depositAddress || ''}
            tag={tag}
            copiedAction={handleCopy}
            dataString={depositAddress || ''}
            depositNetworkId={selectedNetwork}
            asset={asset}
            error={errorResponse}
          />
        )}
        {isCopied && (
          <div
            style={{
              backgroundColor: 'var(--Deep-Space)',
              color: 'var(--White)',
              height: 32,
              borderRadius: 100,
              display: 'flex',
              alignItems: 'center',
              padding: '0 11px',
              justifyContent: 'center',
              width: 136,
              margin: '30px auto',
            }}
          >
            <div style={{ marginRight: 6, marginBottom: 4 }}>Address Copied</div>
            <CheckedIcon />
          </div>
        )}
      </div>
    </div>
  )
}
