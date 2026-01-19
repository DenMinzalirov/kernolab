import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { HeaderTitle, Modal } from 'components'
import { MODAL_TYPES, pages } from 'constant'
import { DepositBankingModal, WithdrawBankingModal } from 'features/modals'
import { getBalanceString, roundingBalance } from 'utils'
import { Currencies } from 'wip/stores'

import { $assetEurData } from '../../model/cefi-combain-assets-data'
import { TxnHistoryFiat } from '../transactions-history/txn-history-fiat'
import { OrderCardFlow } from './order-card-flow'
import styles from './styles.module.scss'

export function Banking() {
  const fiatAsset = useUnit($assetEurData)

  const navigate = useNavigate()

  const goToModal = (type: string) => {
    if (type === MODAL_TYPES.TOP_UP_BANKING) {
      // Modal.open(<DepositBankingModal />, {
      //   variant: 'right',
      //   title: 'Banking',
      //   isFullScreen: true,
      // })

      navigate(pages.DEPOSIT_FIAT.path)
    }

    if (type === MODAL_TYPES.WITHDRAW_BANKING)
      // Modal.open(<WithdrawBankingModal openDeposit={() => goToModal(MODAL_TYPES.TOP_UP_BANKING)} />, {
      //   variant: 'center',
      //   title: 'Banking',
      //   isFullScreen: true,
      // })
      navigate(pages.WITHDRAWAL_FIAT.path)
  }

  return (
    <div
      className='page-container-pairs'
      // className={styles.bankingWrap}
    >
      {/*<div className={styles.headerWrap}>*/}
      <HeaderTitle headerTitle='Banking' />
      {/*</div>*/}
      <div className={styles.mainContent}>
        <div className={styles.balanceWrap}>
          <div className={styles.fiatBalanceCard}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className={styles.balanceTitle}>Fiat Balance</div>
              <div className={styles.balance}>
                {Currencies.EUR}
                {getBalanceString(+roundingBalance(fiatAsset?.availableBalance?.toString() || '0', 2))}
              </div>
            </div>

            <div className={clsx('justify-row-center', styles.fiatBtnWrap)}>
              <button
                onClick={() => goToModal(MODAL_TYPES.TOP_UP_BANKING)}
                className={clsx('btn-new', 'primary', 'big', styles.fiatBtn)}
              >
                <div className={styles.btnTitle}>Top Up</div>
              </button>
              <button
                onClick={() => goToModal(MODAL_TYPES.WITHDRAW_BANKING)}
                className={clsx('btn-new', 'primary', 'big', 'grey', styles.fiatBtn)}
                // style={{ backgroundColor: '#FFF', color: '#262832', border: '1px solid #262832', marginLeft: 12 }}
              >
                <div className={styles.btnTitle}>Withdraw</div>
              </button>
            </div>
          </div>

          <div className={styles.fiatTransactionWeb}>
            <TxnHistoryFiat />
          </div>
        </div>

        {/*<OrderCardFlow goToTopUp={() => goToModal(MODAL_TYPES.TOP_UP_BANKING)} />*/}
      </div>
    </div>
  )
}
