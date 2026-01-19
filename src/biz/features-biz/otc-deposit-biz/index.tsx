import { useState } from 'react'
import QRCode from 'react-qr-code'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { InsufficientFundsActions } from 'components/insufficient-funds-actions'
import { SuccessfullyBiz } from 'components/successfully-biz'
import { pages } from 'constant'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { OtcService } from 'wip/services/otc'
import { CopyIcon } from 'icons'
import { $assetEurData, $assetsListData, CombinedObject } from 'model/cefi-combain-assets-data'
import { getOtcFx } from 'model/otc'

import styles from './styles.module.scss'

const STEP = {
  FROM_BALANCE: 'FROM_BALANCE',
  DEPOSIT: 'DEPOSIT',
  SUCCESS: 'SUCCESS',
}

export const OtcDepositBiz = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const data = location.state?.data
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
      <div className={clsx(styles.container)}>
        <div className={styles.contentWrap}>
          <SuccessfullyBiz
            textData={{
              title: 'Deposit Completed Successfully',
              // eslint-disable-next-line max-len
              description: `Please wait while we prepare your OTC offer.\nYou\u2019ll receive the details shortly to review.`,
              btnText: 'Return to OTC Dashboard',
            }}
            action={() => navigate(pages.OTC.path)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(styles.container)}>
      <div className={styles.contentWrap}>
        <div>
          <div className={styles.staticSection}>
            <div className={styles.textWrap}>
              <div className={styles.title}>OTC Deposit</div>
              <div className={styles.subTitle}>
                Please note that the deposit amount will be temporarily frozen until the trade offer is either accepted
                or rejected.
              </div>
            </div>

            <div className={styles.switchWrap}>
              <p className={styles.switchLabel}>Payment Method</p>
              <div className={styles.switchContainer}>
                <div
                  onClick={() => setStep(STEP.FROM_BALANCE)}
                  className={clsx(styles.switchBtn, step === STEP.FROM_BALANCE && styles.switchBtnActive)}
                  style={{ cursor: 'pointer' }}
                >
                  From Balance
                </div>

                <div
                  // onClick={() => setStep(STEP.DEPOSIT)} //TODO Включить после реализации функционала на бэкенде.
                  className={clsx(styles.switchBtn, step === STEP.DEPOSIT && styles.switchBtnActive)}
                >
                  Deposit
                </div>
              </div>
            </div>

            <div className={styles.sectionAmount}>
              <div className={styles.amountText}>Amount to Pay:</div>
              <div className={styles.amountSubText}>
                {addCommasToDisplayValue((+data.fromAmount).toString())} {data.fromAssetId}
              </div>
            </div>
          </div>

          <div className={styles.dynamicSection}>
            {step === STEP.FROM_BALANCE ? (
              <div className={styles.sectionBalance}>
                <div className={styles.balanceWrap}>
                  <img src={currentAsste?.icon} className={styles.icon} alt='asste icon' />

                  <div className={clsx(styles.balanceText, isBalanceEnough ? '' : styles.redColor)}>
                    {currentAsste?.assetId} Balance
                  </div>
                </div>
                <div className={clsx(styles.balanceText, isBalanceEnough ? '' : styles.redColor)}>
                  {addCommasToDisplayValue(currentAsste?.availableBalance?.toString() || '', 8)} {currentAsste?.assetId}
                </div>
              </div>
            ) : null}

            {step === STEP.DEPOSIT ? ( //TODO доделать для Deposit
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
            {/* <img alt='warning' src={dangerOrange} /> */}
            <div className={styles.attentionText}>
              After deposit you will receive a confirmation email shortly, and the OTC offer will be sent to you soon
              for your review.
            </div>
          </div>
        ) : null}

        {step === STEP.FROM_BALANCE && isBalanceEnough ? (
          <button onClick={handleDeposit} className='btn-biz blue big'>
            {isLoading ? <span className='spinner-border' /> : 'Deposit Now'}
          </button>
        ) : null}

        {/* TODO refactor InsufficientFundsActions  как будет реализован Deposit кнопка*/}
        {step === STEP.FROM_BALANCE && !isBalanceEnough ? <InsufficientFundsActions /> : null}
      </div>
    </div>
  )
}
