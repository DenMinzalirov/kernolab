import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CommonDropdown, HeaderTitle, InputAmount, Modal, RequestError, SummaryBlockStake } from 'components'
import { pages } from 'constant'
import { SuccessPairs } from 'features/success-pairs'
import { getBalanceString } from 'utils'
import { EVENT_NAMES, SimpleStakingPlansResponse, StakingServices, useAnalytics } from 'wip/services'
import { Currencies } from 'wip/stores'
import { updateEarning } from 'wip/stores/init'
import { TriangleIcon } from 'icons'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { $allStakingContracts, $stakingPlans, $tierLevel } from 'model/cefi-stacking'
import { $currency } from 'model/currency'
import dangerOrange from 'assets/icons/danger-orange.svg'
import infoIconError from 'assets/icons/info-icon-error.svg'

import styles from './styles.module.scss'

type Inputs = {
  amount: string
}

const defaultValues = {
  amount: '',
}

export function EarnAdd() {
  const assets = useUnit($assetsListData)
  const currency = useUnit($currency)
  const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'
  const stakingPlans = useUnit($stakingPlans)
  const stackingList = useUnit($allStakingContracts)

  // //TODO: refactor for Launchpad
  // const tierLimits = {
  //   '1': currency === '$' ? 100 : 93,
  //   '2': currency === '$' ? 250 : 232,
  //   '3': currency === '$' ? 1000 : 926,
  //   '4': currency === '$' ? 2000 : 1852,
  // }

  const tierLevel = useUnit($tierLevel)
  // @ts-ignore
  const tierLimit = 0 // tierLimits[tierLevel] || 1

  const { myLogEvent } = useAnalytics()
  const { simplePlans, rollingLeveledPlans } = stakingPlans
  const navigate = useNavigate()

  const methods = useForm<Inputs>({ defaultValues })
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    setError,
  } = methods

  const watchAmount = watch('amount').replace(',', '.')

  const [contract, setContract] = useState<SimpleStakingPlansResponse | null>(null)
  const [isCurrency, setIsCurrency] = useState(false)
  const [isReadyStack, setIsReadyStack] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccessful, setIsSuccessful] = useState(false)

  const asset = assets.find(token => token.assetId === contract?.assetId) || assets[0]

  // Rollin Lv scheme
  const assetIdRollingLeveledPlans =
    rollingLeveledPlans && rollingLeveledPlans.length ? rollingLeveledPlans[0].assetId : null

  const rollingLeveledStakeAmount = stackingList
    .filter(stake => stake.assetId === assetIdRollingLeveledPlans)
    .reduce((acc, stake) => {
      return acc + +stake.amount
    }, 0)

  const rollingLevelPlanControl = () => {
    const sortedRollingLeveledPlans = rollingLeveledPlans
      .slice()
      .sort((a, b) => +b.minimalTargetPlanAmount - +a.minimalTargetPlanAmount)

    const targetPlan =
      sortedRollingLeveledPlans.find(
        plan => rollingLeveledStakeAmount + +(watchAmount || 0) >= +plan.minimalPlanAmount
      ) || sortedRollingLeveledPlans[sortedRollingLeveledPlans.length - 1]

    const oldPlan = stackingList.find(stack => stack.isRollingLeveled && stack.assetId === assetIdRollingLeveledPlans)
    const oldPlanData = sortedRollingLeveledPlans.find(plan => plan.id === oldPlan?.planId)
    const planIdForRequest =
      oldPlanData && targetPlan && +oldPlanData.minimalTargetPlanAmount >= +targetPlan.minimalTargetPlanAmount
        ? oldPlanData
        : targetPlan

    setContract(planIdForRequest)
  }

  useEffect(() => {
    if (contract?.assetId !== assetIdRollingLeveledPlans) {
      setValue('amount', '')
    }

    if (contract?.assetId === assetIdRollingLeveledPlans) {
      rollingLevelPlanControl()
    }

    clearErrors()
  }, [contract])

  useEffect(() => {
    if (requestError) {
      setRequestError('')
    }
    if (contract?.assetId === assetIdRollingLeveledPlans) {
      rollingLevelPlanControl()
    }
  }, [watchAmount])

  const currencySymbol = currency.symbol === Currencies.USD ? 'USD' : 'EUR'

  const assetAmountLimits = +watchAmount * (asset?.[currencyType]?.price || 0) || 0

  const validateAmount = (): boolean => {
    if (+watchAmount > 0 && tierLimit > assetAmountLimits) {
      // !requestError && setRequestError(`min ${tierLimit} ${currencySymbol}`)
      !requestError && setRequestError(`Minimal earning amount is ${tierLimit} ${currencySymbol}`)
      return true
    }
    return !asset || !Number(asset.availableBalance) || errors.amount?.type === 'validate'
  }

  const handleConfirm = async (): Promise<void> => {
    // eslint-disable-next-line no-useless-return
    if (validateAmount()) return

    if (+watchAmount < Number(contract?.minimalStakingAmount || 0)) {
      setError('amount', { message: 'min amount', type: 'min' })
      return
    }

    setIsReadyStack(true)
    if (isReadyStack && !!contract) {
      setIsLoading(true)
      try {
        const stakingService = ['FI', 'PAIRS'].includes(contract.assetId)
          ? StakingServices.rollingCreate
          : StakingServices.simpleCreate
        await stakingService({
          amount: +(isCurrency ? getBalanceString(+watchAmount / (asset[currencyType].price || 1), 2) : watchAmount),
          planId: contract.id,
        })
        await updateEarning()

        if (contract.assetId === 'XRP') {
          myLogEvent(EVENT_NAMES.WEB_EARN_XRP, { amount: +watchAmount })
        }

        setIsSuccessful(true)
      } catch (error: any) {
        console.log('ERROR-handleSimpleStack', error)
        setRequestError(error?.code || error.message)
      }
      setIsLoading(false)
    }
  }

  const itemComponent = (plan: SimpleStakingPlansResponse) => {
    if (!plan) return <div className={styles.dropDownPlaceholderText}>Choose from the list</div>

    const assetComponent = assets.find(assetItem => assetItem.assetId === plan.assetId)

    let stakingApyPercentRolling = ''
    if (plan.assetId === assetIdRollingLeveledPlans) {
      const apiPercent = rollingLeveledPlans.map(plan => +plan.stakingApyPercent).sort()
      stakingApyPercentRolling = `${apiPercent[0]} - ${apiPercent[apiPercent.length - 1]}`
    }

    const stakingApyPercent =
      plan.assetId === assetIdRollingLeveledPlans
        ? stakingApyPercentRolling
        : parseFloat(plan.stakingApyPercent.toString())

    return (
      <div
        key={plan.assetId}
        onClick={() => {
          setContract(plan)
        }}
        className={clsx(styles.dropDownSelectedRow, styles.networksDropdownItem)}
      >
        <div className={styles.dropDownRowIconWrap}>
          {assetComponent && <img src={assetComponent.icon} className={styles.assetIcon} alt='' />}
          <div className={styles.assetIdText}>{plan.assetId}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={styles.dropDownRowText}>{stakingApyPercent}% APY</div>
          <div style={{ width: 5, height: 5, borderRadius: 5, backgroundColor: '#445374', margin: 5 }} />
          <div className={styles.dropDownRowText} style={{ marginRight: 20 }}>
            {plan.stakingPeriod} Days
          </div>
        </div>
      </div>
    )
  }

  if (isSuccessful) {
    return (
      <SuccessPairs
        title={'Earning Successfully Setup'}
        description={
          'Your earning setup is now complete. You can start generating rewards and track your earnings seamlessly.'
        }
        headerTitle={'New Earning'}
        btnText='Go Back to Earn'
        btnAction={() => {
          navigate(pages.EARN.path)
        }}
      />
    )
  }

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={'New Earning'} showBackBtn />

      <div className={styles.contentWrap}>
        <FormProvider {...methods}>
          <form className={styles.container} onSubmit={handleSubmit(handleConfirm)}>
            <div className={styles.content}>
              {isReadyStack ? (
                <>
                  <div className={styles.titleSummary}>New Earning Preview</div>
                  <div className={styles.descriptionSumarry}>Make sure the following information is correct.</div>
                  <SummaryBlockStake
                    amount={watchAmount}
                    assetRate={asset[currencyType].price}
                    fromAssetId={asset.assetId}
                    targetPlan={contract}
                    currentStakingApyPercent={contract?.stakingApyPercent}
                    maxOtherApiPercent={contract?.stakingApyPercent}
                    isCurrency={isCurrency}
                  />
                  <div className={styles.attentionText}>
                    <img className={styles.attentionIcon} alt='' src={dangerOrange} />
                    <div>By confirming a new lock group will be created under your current Tier.</div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.title}>New Earning</div>
                  <div className={styles.enterAmount}>Asset</div>
                  <CommonDropdown
                    data={[
                      ...simplePlans.filter(plan => plan.assetId !== contract?.assetId && plan.assetId !== null),
                      rollingLeveledPlans[0],
                    ]}
                    selectedData={contract}
                    itemComponent={itemComponent}
                    setSelectedData={setContract}
                  />
                  <div style={{ height: 20 }} />

                  {asset && contract && (
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
                      minAmountAsset={contract?.minimalStakingAmount}
                    />
                  )}

                  {errors.amount?.type === 'min' ? (
                    <div className={styles.errorWrap}>
                      <img src={infoIconError} alt={''} className={styles.errorIcon} />
                      <div className={styles.errorText}>The amount entered is below the minimum required</div>
                    </div>
                  ) : (
                    <div style={{ height: 20 }} />
                  )}
                </>
              )}

              {!asset && <div style={{ height: 100 }} />}

              {!isReadyStack && (
                <div className={styles.tierRateWrap}>
                  <div className={styles.tierRateTitle}>Your Tier Rate</div>
                  <div className={styles.tierRateApy}>{Number(contract?.stakingApyPercent) || '-'}% APY</div>
                </div>
              )}

              <div className={styles.autoHeight} />

              {asset && (
                <div className={styles.btnsWrap}>
                  {isReadyStack && (
                    <button
                      type='button'
                      onClick={e => {
                        e.preventDefault()
                        setIsReadyStack(false)
                        setRequestError('')
                      }}
                      className={clsx('btn-new grey big', styles.btnBack)}
                      disabled={isLoading}
                    >
                      <div style={{ height: 16, width: 16, marginRight: 6 }}>
                        <TriangleIcon fill={'var(--Deep-Space)'} />
                      </div>
                      <div>Step Back</div>
                    </button>
                  )}

                  <button
                    type='submit'
                    className='btn-new primary big'
                    style={validateAmount() ? { backgroundColor: 'var(--P-System-Red)' } : {}}
                    onClick={() => {
                      if (validateAmount()) {
                        navigate(pages.PORTFOLIO.path)
                        Modal.close()
                      }
                    }}
                  >
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {isLoading ? (
                      <span className='spinner-border' />
                    ) : // eslint-disable-next-line no-nested-ternary
                    isReadyStack ? (
                      'Confirm & Lock'
                    ) : validateAmount() ? (
                      'Get Coin'
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              )}

              {requestError ? <RequestError requestError={requestError} /> : null}

              <div style={{ height: 20 }} />
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
