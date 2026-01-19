import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages } from 'constant'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { CombinedObject } from 'model/cefi-combain-assets-data'
import { $currency, LowercaseCurrencyType } from 'model/currency'

import { theme, themeValue } from '../../config'
import styles from './styles.module.scss'
import { AssetDetailsMobileModalBiz } from 'biz/features-biz/modals-biz/asset-details-mobile-modal-biz'
import { useCurrentBreakpoint } from 'hooks/use-current-breakpoint'

type Props = {
  asset: CombinedObject
}

export const CryptoWalletRow = ({ asset }: Props) => {
  const navigate = useNavigate()

  const { isMobileBiz } = useCurrentBreakpoint()

  const currency = useUnit($currency)
  const currencyType: 'eur' | 'usd' = (currency?.type?.toLowerCase() as LowercaseCurrencyType) || 'eur'

  const navigateToReceiveCrypto = () => {
    navigate(pages.RECEIVE_CRYPTO.path, { state: { asset: asset } })
  }
  const navigateToSendCrypto = () => {
    navigate(pages.SEND_CRYPTO.path, { state: { asset: asset } })
  }

  const amount = (asset?.availableBalance || 0).toString()
  const amountForDisplay = addCommasToDisplayValue(amount, 8)
  const currencyAmount =
    (
      (+asset?.availableBalance > 0.000001 ? +asset?.availableBalance : 0) * (asset?.[currencyType]?.price || 0)
    ).toString() || '0'
  const currencyAmountForDisplay = addCommasToDisplayValue(currencyAmount, 2)

  const isZekretTheme = theme === themeValue.zekret

  const handleRowClick = () => {
    if (isZekretTheme) return
    if (isMobileBiz) Modal.open(<AssetDetailsMobileModalBiz asset={asset} />, { variant: 'center' })
  }

  return (
    <div className={styles.row} onClick={handleRowClick}>
      <div className={styles.walletAsset}>
        <img className={clsx('asset-icon', styles.walletAssetIcon)} src={asset?.icon} alt='' />
        <div className={styles.walletAssetWrapText}>
          <div className={clsx(styles.walletText, styles.noWrapText)}>{asset?.assetName}</div>
          <div className={styles.walletSubText}>{asset?.assetId}</div>
        </div>
      </div>

      <div className={styles.rowAmount}>
        <div className={styles.walletText}>
          {amountForDisplay} {asset?.assetId}
        </div>
        <div className={styles.walletSubText}>
          {currency.symbol} {currencyAmountForDisplay}
        </div>
      </div>

      <div className={styles.rowButtons}>
        <button onClick={navigateToReceiveCrypto} disabled={isZekretTheme} className='btn-biz blue'>
          Receive
        </button>
        <button onClick={navigateToSendCrypto} disabled={isZekretTheme} className='btn-biz grey'>
          Send
        </button>
      </div>
    </div>
  )
}
