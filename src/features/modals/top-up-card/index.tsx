import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { Modal } from 'components'
import { InsufficientFundsActionsPairs } from 'components/insufficient-funds-actions-pairs'
import { roundingBalance } from 'utils'
import { handleError } from 'utils/error-handler'
import { initApp } from 'wip/stores'
import { topUpCardFx } from 'model/cefi-banking'
import { $tierLevel } from 'model/cefi-stacking'
import infoIconError from 'assets/icons/info-icon-error.svg'

import { CARD_TOP_UP_FEE_PERCENT } from '../../../constant/tier-fee-discounts'
import { $assetEurData } from '../../../model/cefi-combain-assets-data'
import styles from './styles.module.scss'
import { TopUpInput } from './top-up-input'
import { useCurrentBreakpointPairs } from 'hooks/use-current-breakpoint-pairs'

export type TopUpCardInputsData = {
  amount: string
}

const defaultValues = {
  amount: '',
}

export function TopUpCard() {
  const tierLevel = useUnit($tierLevel)
  const { isMobilePairs } = useCurrentBreakpointPairs()

  const methods = useForm<TopUpCardInputsData>({ defaultValues })
  const {
    handleSubmit,
    formState: { errors },
    watch,
  } = methods

  const watchAmount = watch('amount').replace(',', '.')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const fiatAsset = useUnit($assetEurData) // assets.find(assetItem => assetItem.isFiat)

  const handleTopUpCard = async (data: any): Promise<void> => {
    setIsLoading(true)
    try {
      await topUpCardFx({
        assetId: 'EUR',
        amount: data.amount,
      })
      await initApp()
      setIsSuccessful(true)
    } catch (e: any) {
      console.log('ERROR-handleTopUpCard', e)
      // handleError(e)
      setIsSuccessful(true)
    }
    setIsLoading(false)
  }

  const calculateFeePercentage = (tier: number): number => {
    return CARD_TOP_UP_FEE_PERCENT[tier] ?? 1.0
  }

  const topUpFee = calculateFeePercentage(tierLevel)

  if (isSuccessful) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successContentWrap}>
          <div className={styles.title}>Card Top Up Completed Successfully!</div>
          <div className={styles.description}>We have successfully processed your top up request.</div>
        </div>
        <button className={`btn-new primary ${isMobilePairs ? 'big' : ''}`} onClick={() => Modal.close()}>
          Close
        </button>
      </div>
    )
  }
  const isSufficientBalance = Number(fiatAsset?.availableBalance || 0) >= +watchAmount
  const availableBalance = roundingBalance(fiatAsset?.availableBalance?.toString() || '0', 2)

  return (
    <div className={styles.topUpCardWrap}>
      <FormProvider {...methods}>
        <form className={styles.formWrap} onSubmit={handleSubmit(handleTopUpCard)}>
          <div className={styles.contentWrap}>
            <div className={styles.title}>Top Up Card</div>
            <div className={styles.height8} />
            <div className={styles.description}>
              To top up card enter the top up amount and then this amount will be deducted from your fiat balance.
            </div>

            <div className={styles.height53} />

            <div className={'input-item-wrap-new'}>
              <label htmlFor='amount' className={`input-label`}>
                Amount
              </label>
              <TopUpInput
                formMethods={methods}
                maxValue={+availableBalance}
                minValue={25}
                assetId={'EUR'}
                isError={!isSufficientBalance}
              />
            </div>

            <div style={{ height: 10 }} />

            <div className={clsx(styles.fiatBalanceAmount, isSufficientBalance ? {} : styles.colorRed)}>
              {!isSufficientBalance ? <img src={infoIconError} alt={''} className={styles.errorIcon} /> : null}
              {isSufficientBalance ? ' Fiat Balance:' : 'Insufficient Balance:'} {availableBalance} EUR
            </div>

            <div className={styles.topUpFee}>Top Up Fee: {topUpFee}%</div>

            {isSufficientBalance ? (
              <div className={styles.buttonsWrap}>
                <button
                  type='submit'
                  className={`btn-new primary ${isMobilePairs ? 'big' : ''} ${errors.amount ? 'red' : ''}`}
                  disabled={isLoading || +watchAmount < 25}
                >
                  {isLoading ? <span className='spinner-border' /> : 'Top Up Now'}
                </button>
              </div>
            ) : (
              <div className={styles.insufficientBtnsWrap}>
                <InsufficientFundsActionsPairs />
              </div>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
