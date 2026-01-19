import { useState } from 'react'
import QRCode from 'react-qr-code'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CompleteIconBlur, Modal } from 'components'
import { InsufficientFundsActions } from 'components/insufficient-funds-actions'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { OTCResponse, OtcService } from 'wip/services/otc'
import { CopyIcon } from 'icons'
import { $assetEurData, $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'
import { getOtcFx } from 'model/otc'
import dangerOrange from 'assets/icons/danger-orange.svg'

import styles from './styles.module.scss'

const STEP = {
  FROM_BALANCE: 'FROM_BALANCE',
  DEPOSIT: 'DEPOSIT',
  SUCCESS: 'SUCCESS',
}
type Props = {
  data: OTCResponse
}

export const OtcDepositFundsModal = ({ data }: Props) => {
  const assets = useUnit($assetsListData)
  const assetEurData = useUnit($assetEurData)
  const allAssets: CombinedObject[] = [...assets, assetEurData] as CombinedObject[]

  const [step, setStep] = useState(STEP.FROM_BALANCE)
  const [isLoading, setIsLoading] = useState(false)

  const handleDeposit = async () => {
    setIsLoading(true)
    try {
      await OtcService.depositFromBalance(data.id)

      await getOtcFx()
      setStep(STEP.SUCCESS)
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentAsste = allAssets.find(asset => asset.assetId === data.fromAssetId)
  const isBalanceEnough = currentAsste?.availableBalance ? currentAsste?.availableBalance >= +data.fromAmount : false

  if (step === STEP.SUCCESS) {
    return (
      <div className={styles.stepSuccess}>
        <CompleteIconBlur />
        <div className={styles.stepSuccessTitleWrap}>
          <div className={styles.stepSuccessTitle}>Deposit Completed Successfully</div>
          <div className={styles.stepSuccessSubTitle}>
            Please wait while we prepare your OTC offer.
            <br /> You{"'"}ll receive the details shortly to review.
          </div>
        </div>

        <div className={styles.buttons}>
          <button onClick={() => Modal.close()} className={clsx('btn', 'btn-primary', styles.button)}>
            {isLoading ? <span className='spinner-border' /> : 'Return to OTC Dashboard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(styles.container)}>
      <div className={styles.content}>
        <div className={styles.textWrap}>
          <div className={styles.title}>Deposit Funds</div>
          <div className={styles.subTitle}>
            Please note that the deposit amount will be temporarily frozen until the trade offer is either accepted or
            rejected.
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionAmount}>
            <div className={styles.amountText}>Amount to Pay:</div>
            <div className={styles.amountSubText}>
              {addCommasToDisplayValue((+data.fromAmount).toString())} {data.fromAssetId}
            </div>
          </div>

          <div className={styles.sectionBtnSwitch}>
            <div
              onClick={() => setStep(STEP.FROM_BALANCE)}
              className={clsx(styles.btnSwitch, step === STEP.FROM_BALANCE && styles.btnSwitchColorActive)}
            >
              From Balance
            </div>

            <div
              // onClick={() => setStep(STEP.DEPOSIT)} //TODO Включить после реализации функционала на бэкенде.
              className={clsx(styles.btnSwitch, step === STEP.DEPOSIT && styles.btnSwitchColorActive)}
            >
              Deposit
            </div>
          </div>

          {step === STEP.FROM_BALANCE ? (
            <div className={styles.sectionBalance}>
              <div className={styles.balanceWrap}>
                <img src={currentAsste?.icon} className={styles.icon} alt='asste icon' />

                <div className={clsx(styles.balanceText, isBalanceEnough ? '' : styles.redColor)}>
                  {currentAsste?.assetId} Balance
                </div>
              </div>
              <div className={clsx(styles.balanceText, isBalanceEnough ? '' : styles.redColor)}>
                {addCommasToDisplayValue(currentAsste?.availableBalance?.toString() || '')} {currentAsste?.assetId}
              </div>
            </div>
          ) : null}

          {step === STEP.DEPOSIT ? ( //TODO доделать
            <div className={styles.sectionQrCode}>
              <div className={styles.qrCode}>
                <QRCode
                  size={166}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  value={'0x4D0580fd60DF604876256e1225766637Eb221ddA'}
                  viewBox='0 0 256 256'
                />
              </div>

              <div className={styles.qrCodeContent}>
                <div className={styles.network}>
                  <div className={styles.qrCodeContentLabel}>Choose network</div>
                  <div className={styles.networkBtnGrup}>
                    <div className={styles.networkBtn}>BSC</div>
                    <div className={styles.networkBtn}>MATIC</div>
                    <div className={styles.networkBtn}>ETH</div>
                  </div>
                </div>

                <div className={styles.address}>
                  <div className={styles.qrCodeContentLabel}>Deposit Address:</div>
                  <div className={styles.copyString}>
                    <div>0x4D0580fd60DF60487625...</div>
                    <CopyIcon isMobile={false} fill='var(--mainBlue)' />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {step === STEP.DEPOSIT ? (
        <div className={styles.attention}>
          <img alt='warning' src={dangerOrange} />
          <div className={styles.attentionText}>
            After deposit you will receive a confirmation email shortly, and the OTC offer will be sent to you soon for
            your review.
          </div>
        </div>
      ) : null}

      {step === STEP.FROM_BALANCE && isBalanceEnough ? (
        <div className={styles.buttons}>
          <button onClick={handleDeposit} className={clsx('btn', 'btn-primary', styles.button)}>
            {isLoading ? <span className='spinner-border' /> : 'Deposit Now'}
          </button>
        </div>
      ) : null}
      {step === STEP.FROM_BALANCE && !isBalanceEnough ? <InsufficientFundsActions /> : null}
    </div>
  )
}
