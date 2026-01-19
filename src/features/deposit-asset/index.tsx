import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'

import { CommonDropdown, HeaderTitle, QRCodeBlock, Spinner } from 'components'
import { CommonDropdownBiz } from 'components/common-dropdown-biz'
import { getNetworkIcon } from 'utils/get-network-icon'
import { EVENT_NAMES, NetworkWithAssetInfo, useAnalytics } from 'wip/services'
import { CryptoDepositsServices } from 'wip/services/crypto-deposits'
import { CheckedIcon } from 'icons'

import { CombinedObject } from '../../model/cefi-combain-assets-data'
import styles from './styles.module.scss'

export function DepositAsset() {
  // const navigate = useNavigate()
  // const { assetId } = useParams()
  const location = useLocation()
  const asset = location.state?.asset as CombinedObject

  const { myLogEvent } = useAnalytics()

  const availableNetworks = asset.networksInfo.filter(networkInfo => networkInfo.depositAvailable)

  const [isLoading, setIsLoading] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkWithAssetInfo | null>(
    availableNetworks.length === 1 ? availableNetworks[0] : null
  )
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
    if (!selectedItemAddress) return <div className={styles.dropdownPlaceholder}>Choose from the list</div>

    const networkIcon = getNetworkIcon(selectedItemAddress.networkId)

    return (
      <div className={styles.dropdownItemRow}>
        <img className={clsx('asset-icon', styles.dropdownItemRowIcon)} src={networkIcon} alt='' />

        <div className={styles.dropdownItemRowTitle}>{selectedItemAddress?.networkId}</div>
      </div>
    )
  }

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={asset.assetName} showBackBtn />
      <div className={styles.contentWrap}>
        <div className={styles.content}>
          <div className={styles.title}>Deposit {asset?.assetName}</div>

          {availableNetworks.length > 1 ? (
            <div className={styles.dropdownWrap}>
              <div className={styles.dropdownLabel}>Network</div>
              <CommonDropdownBiz
                data={availableNetworks}
                itemComponent={itemComponentAddresses}
                setSelectedData={setSelectedNetwork}
                selectedData={selectedNetwork}
              />
            </div>
          ) : null}

          {isLoading ? (
            <div className={styles.spinnerWrap}>
              <Spinner />
            </div>
          ) : null}

          {selectedNetwork && !isLoading ? (
            <QRCodeBlock
              stringCode={depositAddress || ''}
              tag={tag}
              copiedAction={handleCopy}
              dataString={depositAddress || ''}
              depositNetworkId={selectedNetwork}
              asset={asset}
              error={errorResponse}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
