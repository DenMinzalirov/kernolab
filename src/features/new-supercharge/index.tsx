import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import moment from 'moment'
import clsx from 'clsx'

import { HeaderTitle, InputAmount, RequestError } from 'components'
import { pages } from 'constant'
import { SuccessPairs } from 'features/success-pairs'
import { getBalanceString } from 'utils'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { StakingCampaignResponse, StakingServices } from 'wip/services'
import { updateEarning } from 'wip/stores/init'
import { TriangleIcon } from 'icons'
import { HELP_LINKS } from 'config'
import { $assetsRates } from 'model/cef-rates-coingecko'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $campaignStakingContracts, $stakingPlans } from 'model/cefi-stacking'
import { $currency } from 'model/currency'
import dangerOrange from 'assets/icons/danger-orange.svg'
import infoIconError from 'assets/icons/info-icon-error.svg'

import { NoSuperchargeEvents } from './no-supercharge-events'
import styles from './styles.module.scss'
import { SuperchargeCard } from './supercharge-card'

type Inputs = {
  amount: string
}

const defaultValues = {
  amount: '',
}

export function NewSupercharge() {
  const navigate = useNavigate()
  const stakeItem = useLocation()?.state?.stakeItem
  const currency = useUnit($currency)
  const assets = useUnit($assetsListData)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'
  const ratesRaw = useUnit($assetsRates)

  const superChargeListContracts = useUnit($campaignStakingContracts)
  const stakingPlans = useUnit($stakingPlans)
  const campaignPlans = stakingPlans?.campaignPlans || []
  const [campaignPlanForStake, setCampaignPlanForStake] = useState<StakingCampaignResponse | null>(() => {
    return stakeItem ? campaignPlans.find(plan => plan.id === stakeItem.campaignId) || null : null
  })
  const [isCurrency, setIsCurrency] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isReadyStack, setIsReadyStack] = useState(false)
  const [errorAmountMsg, setErrorAmountMsg] = useState('')
  const [requestError, setRequestError] = useState('')
  const [isSuccessful, setIsSuccessful] = useState(false)

  const asset = assets.find(token => token.assetId === campaignPlanForStake?.assetId) || assets[0]

  // const assetRate = ratesRaw?.find(
  //   assetRateRaw =>
  //     assetRateRaw.fromAssetId === campaignPlanForStake?.assetId && assetRateRaw.toAssetId === currency.type
  // )

  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = methods

  const watchAmount = watch('amount').replace(',', '.')

  useEffect(() => {
    setErrorAmountMsg('')
  }, [watchAmount])

  const isGetCoinBtn = (): boolean => {
    if (errorAmountMsg || (errors.amount && errors.amount.type === 'validate')) {
      return true
    }
    return false
  }

  const handleConfirm = () => {
    if (campaignPlanForStake && +watchAmount < +campaignPlanForStake?.minimalStakingAmount) {
      setErrorAmountMsg('The amount entered is below the minimum required')
      return
    }

    if (!isReadyStack) {
      setIsReadyStack(true)
      return
    }
  }

  const handleLock = async () => {
    setIsLoading(true)
    try {
      const isHavePlanOnStake = superChargeListContracts.find(
        contract => contract.campaignId === campaignPlanForStake?.id
      )

      // if (stakeItem || isHavePlanOnStake) {
      //   const data = stakeItem || isHavePlanOnStake
      //   await StakingServices.campaignUpdate({
      //     contractId: data!.id,
      //     campaignId: data!.campaignId,
      //     userStakingAmount: +data!.userStakingAmount + +watchAmount,
      //   })
      // } else {
      await StakingServices.campaignCreate({
        planId: +campaignPlanForStake!.id,
        amount: +watchAmount,
      })
      // }

      await updateEarning()

      setIsSuccessful(true)
    } catch (error: any) {
      console.error('Campaign lock', error)
      const message = handleError(error, true)
      setRequestError(message || '')
    }
    setIsLoading(false)
  }

  if (isSuccessful) {
    return (
      <SuccessPairs
        title='Supercharge Setup Successfully'
        description={
          'Your Supercharge setup is complete! You are now earning rewards—track your progress and maximize your benefits'
        }
        headerTitle={'New Supercharge'}
        btnText='Go Back to Earn'
        btnAction={() => {
          navigate(pages.EARN.path)
        }}
      />
    )
  }

  if (isReadyStack && campaignPlanForStake) {
    return (
      <div className='page-container-pairs'>
        <HeaderTitle headerTitle={'New Supercharge'} showBackBtn />

        <div className={styles.contentSummaryWrap}>
          <div className={styles.contentSummary}>
            <div className={styles.summaryTitle}>Supercharge Preview</div>
            <div className={styles.summarySubTitle}>Make sure the following information is correct.</div>
            <div className={styles.summaryBlockTitle}>Amount</div>
            <div className={styles.summaryBlockSubTitle}>
              {campaignPlanForStake.assetId} {watchAmount}
            </div>
            <div className={styles.summaryCurrencyAmount}>
              {currency.symbol}
              {isCurrency ? watchAmount : getBalanceString(+watchAmount * (asset[currencyType].price || 1), 2)}
            </div>
            <div className={styles.summaryConversion}>
              Conversion Rate:&nbsp;&nbsp;1 {asset.assetId} ={' '}
              {addCommasToDisplayValue(asset[currencyType].price.toString(), 4)} {currency.type}
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryBlockTitle}>Locked until</div>
            <div className={styles.summaryBlockSubTitle}>
              {moment(campaignPlanForStake.lockupDate).format('DD MMMM YYYY')}
            </div>
            <div className={styles.summaryAutoHeight100} />

            <div className={styles.summaryAttentionText}>
              <img className={styles.summaryAttentionIcon} alt='' src={dangerOrange} />
              <div>
                By pressing Confirm & Lock you agree to the{' '}
                <NavLink to={HELP_LINKS.TERMS} target='_blank' className={clsx(styles.summaryAttentionDescriptionLink)}>
                  Terms and Conditions.
                </NavLink>
              </div>
            </div>

            <div className={styles.summaryAutoHeight56} />

            {requestError ? <RequestError requestError={requestError} /> : null}
            <div className={styles.summaryBtnsWrap}>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault()
                  setIsReadyStack(false)
                  setRequestError('')
                }}
                className={clsx('btn-new grey big', styles.summaryBtnBack)}
                disabled={isLoading}
              >
                <div style={{ height: 16, width: 16, marginRight: 6 }}>
                  <TriangleIcon fill={'var(--Deep-Space)'} />
                </div>
                <div>Step Back</div>
              </button>

              <button type='submit' className='btn-new primary big' onClick={handleLock}>
                {isLoading ? <span className='spinner-border' /> : 'Confirm & Lock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (campaignPlanForStake) {
    // const asset = assets.find(token => token.assetId === campaignPlanForStake?.assetId)
    // const assetRate = ratesRaw?.find(
    //   assetRateRaw => assetRateRaw.fromAssetId === asset?.assetId && assetRateRaw.toAssetId === currency.type
    // )

    return (
      <div className='page-container-pairs'>
        <HeaderTitle headerTitle={'New Supercharge'} showBackBtn />

        <div className={styles.contentFormWrap}>
          <FormProvider {...methods}>
            <form className={styles.mainForm} onSubmit={handleSubmit(handleConfirm)}>
              <div className={styles.formTitle}>Supercharge {campaignPlanForStake.assetId}</div>
              <InputAmount
                errors={errors}
                asset={asset}
                register={register}
                // assetRate={assetRate}
                setValue={setValue}
                watchAmount={watchAmount}
                isCurrency={isCurrency}
                setIsCurrency={setIsCurrency}
                clearErrors={clearErrors}
                minAmountAsset={campaignPlanForStake?.minimalStakingAmount}
              />

              {errorAmountMsg ? (
                <div className={styles.errorWrap}>
                  <img src={infoIconError} alt={''} className={styles.errorIcon} />
                  <div className={styles.errorText}>{errorAmountMsg}</div>
                </div>
              ) : (
                <div style={{ height: 20 }} />
              )}
              <div style={{ height: 80 }}></div>

              {isGetCoinBtn() ? (
                <button type='button' className='btn-new red big' onClick={() => navigate(pages.PORTFOLIO.path)}>
                  Get Coin
                </button>
              ) : (
                <button type='submit' className='btn-new primary big'>
                  {isLoading ? <span className='spinner-border' /> : 'Continue'}
                </button>
              )}
              <div style={{ flexGrow: 1 }} />
            </form>
          </FormProvider>
        </div>
      </div>
    )
  }

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={'New Supercharge'} showBackBtn />

      <div className={styles.contentWrap}>
        <div className={styles.tableTitleRow}>
          <div className={styles.manageCardSwitchBlock}>
            <div onClick={() => navigate(pages.EARN.path)} className={clsx(styles.manageCardBtn)}>
              Earnings
            </div>
            <div onClick={() => null} className={clsx(styles.manageCardBtn, styles.manageCardBtnActive)}>
              Supercharge
            </div>
          </div>
        </div>

        {campaignPlans.length ? (
          <div className={styles.cardsWrap}>
            {campaignPlans
              .sort((a, b) => {
                const dateA = new Date(a.startDate).getTime()
                const dateB = new Date(b.startDate).getTime()

                return dateA - dateB
              })
              .map(plan => {
                return <SuperchargeCard key={plan.id} plan={plan} setCampaignPlanForStake={setCampaignPlanForStake} />
              })}
          </div>
        ) : (
          <NoSuperchargeEvents />
        )}
      </div>
    </div>
  )
}
