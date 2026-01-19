import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { pages } from 'constant'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { NumberWithZeroCount } from 'utils/number-with-zero-count'
import { CombinedObject } from 'model/cefi-combain-assets-data'
import { $currency } from 'model/currency'

import styles from './styles.module.scss'

type Props = {
  asset: CombinedObject
}

export const AssetDetailsMobileModalBiz = ({ asset }: Props) => {
  const navigate = useNavigate()

  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'usd' | 'eur'

  const navigateToReceiveCrypto = (cryptoAsset: CombinedObject) => {
    navigate(pages.RECEIVE_CRYPTO.path, { state: { asset: cryptoAsset } })
    Modal.close()
  }
  const navigateToSendCrypto = (cryptoAsset: CombinedObject) => {
    navigate(pages.SEND_CRYPTO.path, { state: { asset: cryptoAsset } })
    Modal.close()
  }
  const navigateToTradeCrypto = (cryptoAsset: CombinedObject) => {
    navigate(pages.TRADE_CRYPTO.path, { state: { asset: cryptoAsset } })
    Modal.close()
  }

  const icon = asset?.icon || ''
  const assetName = asset?.assetName || '--'
  const assetId = asset?.assetId || '--'

  const value = (
    (+asset.availableBalance > 0.000001 ? +asset.availableBalance : 0) * asset[currencyType].price
  ).toString()
  const valueForDisplay = addCommasToDisplayValue(value, 8)

  //TODO without converting zeros
  const availableBalance = (+asset.availableBalance > 0.000001 ? +asset.availableBalance : 0).toString()
  const availableBalanceForDiplay = addCommasToDisplayValue(availableBalance, 8)

  // //TODO from converting zeros
  // const availableBalanceAddCommas = addCommasToDisplayValue((asset?.availableBalance || '').toString(), 8)
  // const availableBalanceForDiplay = NumberWithZeroCount({ numberString: availableBalanceAddCommas })

  const receiveEnabled = asset.networksInfo.length
    ? asset.networksInfo.find(networkInfo => networkInfo.depositAvailable)
    : null

  const sendEnabled = asset.networksInfo.length
    ? asset.networksInfo.find(networkInfo => networkInfo.withdrawalAvailable)
    : null

  return (
    <div className={styles.container}>
      <div className={styles.contentWrap}>
        <img className={clsx('asset-icon', styles.icon)} src={icon} alt='' />

        <div className={styles.content}>
          <div className={styles.assetName}>{assetName} Balance</div>

          <div className={styles.assetAmountWrap}>
            <div className={styles.assetAmount}>
              {availableBalanceForDiplay || 0} {assetId}
            </div>

            <div className={styles.assetСonvertedAmount}>
              {currency.symbol}
              {valueForDisplay}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.buttonsWrap}>
        <button onClick={() => navigateToSendCrypto(asset)} className='btn-biz grey' disabled={!sendEnabled}>
          Send
        </button>

        <button onClick={() => navigateToTradeCrypto(asset)} className='btn-biz grey' disabled={false}>
          Trade
        </button>

        <button onClick={() => navigateToReceiveCrypto(asset)} className='btn-biz blue' disabled={!receiveEnabled}>
          Receive
        </button>
      </div>
    </div>
  )
}
