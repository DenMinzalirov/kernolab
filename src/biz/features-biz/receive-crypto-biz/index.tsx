import { useCallback, useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { useLocation } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Spinner } from 'components'
import { CommonDropdownBiz } from 'components/common-dropdown-biz'
import { CopiedBiz } from 'components/copied-biz'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { NetworkWithAssetInfo } from 'wip/services'
import { CryptoDepositsServices } from 'wip/services/crypto-deposits'
import { CircleCheckIcon } from 'icons/circle-check-icon'
import { CopyBizIcon } from 'icons/copy-biz'
import { $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'

export function ReceiveCryptoBiz() {
  const assets = useUnit($assetsListData)
  const receiveListAssets = assets.filter(item => item.networksInfo.some(network => network.depositAvailable))
  const location = useLocation()

  const [selectedAsset, setSelectedAsset] = useState<CombinedObject | null>(location.state?.asset || null)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkWithAssetInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [depositAddress, setDepositAddress] = useState('')
  const [isCopied, setIsCopied] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.asset && location.state?.asset?.networksInfo?.length) {
      const firstDeposit = (location.state?.asset as CombinedObject)?.networksInfo.find(
        networksInfo => networksInfo.depositAvailable
      )

      setSelectedNetwork(firstDeposit || location.state?.asset?.networksInfo[0])
    }
  }, [location.state?.asset])

  const getCoinAddress = useCallback(async () => {
    if (!selectedNetwork) return
    if (!selectedAsset) return
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const depositInfo = await CryptoDepositsServices.getCryptoAddressForAsset(
        selectedAsset.assetId,
        selectedNetwork.networkId
      )
      setDepositAddress(depositInfo.addresses[0].address)
    } catch (error) {
      console.log('ERROR-getCoinAddress', error)

      handleError(error)
    }
    setIsLoading(false)
  }, [selectedAsset, selectedNetwork])

  useEffect(() => {
    if (selectedNetwork) {
      getCoinAddress().finally(() => {})
    }
  }, [selectedNetwork])

  const itemDropDownComponent = (data: CombinedObject) => {
    if (!data) return <div className={styles.dropDownPlaceholderText}>Choose from the list</div>

    if (data.assetName === 'clear') {
      return (
        <div className={styles.dropDownCleareWrap}>
          <div>
            Currently, there are no assets available for receiving.
            <br />
            <br />
            Please check back later, or contact support if&nbsp;you&nbsp;believe this is an error.
          </div>
        </div>
      )
    }
    return (
      <div
        onClick={() => {
          if (isLoading) return
          setSelectedAsset(data)
          data.networksInfo.length && setSelectedNetwork(data.networksInfo[0])
        }}
        className={styles.itemWrap}
      >
        <img className={clsx('asset-icon', styles.assetIcon)} src={data.icon} alt='' />
        {data.assetName} - {data.assetId}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <div className={styles.title}>Receive Crypto</div>
        <div className={clsx(styles.description, styles.hideMd)}>
          To receive crypto, choose the asset and&nbsp;network you&apos;d like to use. The&nbsp;system will&nbsp;then
          display your wallet address. A QR code will&nbsp;also&nbsp;be&nbsp;generated for&nbsp;easier and faster
          deposits.
        </div>
        <div className={clsx(styles.description, styles.showMd)}>
          To receive crypto, select the asset and network. Your wallet address and a QR code will be displayed
          for&nbsp;easy deposits.
        </div>

        <div className={styles.adaptiveHeight} />

        <div className={styles.label}>Asset</div>
        <div className={styles.dropDownWrap}>
          {/* TODO add style for dropdown list (shadow) */}
          <CommonDropdownBiz
            showDropdownForSingleItem={true}
            data={receiveListAssets.length ? receiveListAssets : [{ assetName: 'clear' }]}
            selectedData={selectedAsset}
            itemComponent={itemDropDownComponent}
          />
        </div>
        {selectedAsset ? <div className={clsx(styles.label, styles.marginTop)}>Network</div> : null}
        <div className={styles.networkContainer}>
          {selectedAsset && selectedAsset.networksInfo && selectedAsset.networksInfo.length
            ? selectedAsset.networksInfo.map(networkInfo => {
                const isActive = selectedNetwork?.networkId === networkInfo.networkId

                if (!networkInfo.depositAvailable) return null

                return (
                  <div
                    key={networkInfo.networkId}
                    onClick={() => {
                      if (isLoading) return
                      setSelectedNetwork(networkInfo)
                    }}
                    className={clsx(styles.networkWrap, isActive ? styles.networkActive : '')}
                  >
                    {networkInfo.networkId}
                  </div>
                )
              })
            : null}
        </div>

        {selectedNetwork ? (
          <div className={styles.depositInfoContainer}>
            <div className={styles.qrCodeWrap}>
              {isLoading ? <Spinner /> : <QRCode size={140} value={depositAddress} viewBox='0 0 140 140' />}
            </div>
            <div className={clsx(styles.label, styles.marginTop)}>Deposit Address</div>
            <div
              className={styles.addressWrap}
              onClick={() => {
                navigator.clipboard.writeText(depositAddress).then(() => {
                  setIsCopied(depositAddress)
                  setTimeout(() => {
                    setIsCopied(null)
                  }, 2000)
                })
              }}
            >
              <div className={styles.addressText}>{depositAddress}</div>
              <div className={styles.copyBtn}>{isCopied ? <CircleCheckIcon /> : <CopyBizIcon />}</div>
            </div>
            <div className={styles.note}>
              <span>Note:</span> Minimum deposit is {addCommasToDisplayValue(selectedNetwork.minimumDepositAmount, 6)}{' '}
              {selectedAsset?.assetId}.
              <br />
              Please ensure accuracy to protect your assets.
            </div>

            {isCopied ? (
              <>
                <div className={styles.height10} />
                <div className={styles.copiedWrap}>
                  <CopiedBiz value={'Deposit Address Copied'} />
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
