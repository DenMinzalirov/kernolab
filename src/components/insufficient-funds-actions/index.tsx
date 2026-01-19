import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'

import { Modal } from 'components'
import { pages } from 'constant'
import { DepositBankingModal, TradeAssetModal } from 'features/modals'
import { $assetsListData } from 'model/cefi-combain-assets-data'

import styles from './styles.module.scss'

export const InsufficientFundsActions = () => {
  const navigate = useNavigate()

  const assets = useUnit($assetsListData)
  const asset = assets.find(assetItem => assetItem.assetId === 'USDT')!

  const handleSellCrypto = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    navigate(pages.TRADE_ASSETS.path, { state: { asset } })
    // Modal.open(<TradeAssetModal asset={asset} />, { title: pages.PORTFOLIO.name, isFullScreen: true, variant: 'right' })
  }

  const handleToDeposit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    // Modal.open(<DepositBankingModal />, {
    //   variant: 'right',
    //   title: 'Banking',
    //   isFullScreen: true,
    // })
    navigate(pages.DEPOSIT_FIAT.path)
  }

  const fixBtnStyle = {
    minHeight: '2.5rem',
    fontSize: '14px',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    color: '#ff3b30',
    marginTop: 0,
  }

  return (
    <div className={styles.container}>
      <div className={styles.errorMessage}>Insuffcient Balance</div>
      <div style={{ display: 'flex' }}>
        <button className='btn btn-primary' style={fixBtnStyle} onClick={handleToDeposit}>
          Deposit EUR
        </button>
        <div style={{ width: 20 }} />
        <button
          className='btn btn-red'
          style={{ minHeight: '2.5rem', fontSize: '14px', marginTop: 0 }}
          onClick={handleSellCrypto}
        >
          Sell Crypto
        </button>
      </div>
    </div>
  )
}
