import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { pages } from 'constant'
import { $assetsListData } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export const InsufficientFundsActionsPairs = () => {
  const navigate = useNavigate()
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const assets = useUnit($assetsListData)
  const asset = assets.find(assetItem => assetItem.assetId === 'USDT')!

  const handleSellCrypto = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    navigate(pages.TRADE_ASSETS.path, { state: { asset } })
    Modal.close()
  }

  const handleToDeposit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    navigate(pages.DEPOSIT_FIAT.path)
    Modal.close()
  }

  return (
    <div className={styles.btnWrap}>
      <button className={`btn-new red-10 ${isMobilePairs ? 'big' : ''}`} onClick={handleToDeposit}>
        Deposit EUR
      </button>
      <button className={`btn-new red ${isMobilePairs ? 'big' : ''}`} onClick={handleSellCrypto}>
        Sell Crypto
      </button>
    </div>
  )
}
