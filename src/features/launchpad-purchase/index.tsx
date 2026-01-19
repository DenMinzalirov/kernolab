import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { HeaderTitle } from 'components'
import { LaunchpadCalculatedHint } from 'components/launchpad-calculated-hint'
import { LaunchpadInput } from 'components/launchpad-input'
import { SimpleHint } from 'components/simple-hint'
import { pages } from 'constant'
import { SuccessPairs } from 'features/success-pairs'
import { addCommasToDisplayValue } from 'utils/add-commas-to-display-value'
import { handleError } from 'utils/error-handler'
import { AssetsServices, ExchangeInfo, RollingLeveledStakingPlansResponse, StakingServices } from 'wip/services'
import { LaunchpadProject, LaunchpadService } from 'wip/services/launchpads'
import { updateEarning } from 'wip/stores/init'
import { TriangleIcon } from 'icons'
import { TBDHideId } from 'config'
import { $assetsCefiExchangeRates } from 'model/cef-rates-exchange'
import { $assetsListData } from 'model/cefi-combain-assets-data'
import { myAssetsFx } from 'model/cefi-my-assets-list'
import { $allStakingContracts, $stakingPlans, $tierLevel } from 'model/cefi-stacking'
import {
  $allocationLaunchpad,
  getAllocationLaunchpadFx,
  getAllocationsLaunchpadsFx,
  getLaunchpadFx,
  getLaunchpadsFx,
} from 'model/launchpads'
import infoIcon from 'assets/icons/info-icon.svg'
import infoIconError from 'assets/icons/info-icon-error.svg'

import styles from './styles.module.scss'

type Inputs = {
  amount: string
}

const defaultValues = {
  amount: '',
}

type Props = {
  currentLaunchpad: LaunchpadProject
  unlimitedLevel: number | null
}

export type HintData = {
  allocationPurchase: number
  tierFee: number
  lockedFi: number
  buyingAssetCount: number
  conversionFeeInBuyingAsset: number
  buyingAssetId: string
  tierFeePercent: number
  targetTier: number
  targetFiPlan: RollingLeveledStakingPlansResponse | null
  missingFiAmount: number
  exchangeInfoData: ExchangeInfo | null
}

const STEPS = {
  AMOUNT: 'AMOUNT',
  CONFIRM: 'CONFIRM',
  SUCCESS: 'SUCCESS',
}

// TODO: вывести в конфиг
const tiersFeePercent: Record<string, number> = {
  0: 0.01,
  1: 0.01,
  2: 0.0075,
  3: 0.0025,
  4: 0,
}

const feeFI = 0.045 // 4.5% fee for USDT->FI

export function LaunchpadPurchase() {
  const navigate = useNavigate()
  const location = useLocation().state

  const currentLaunchpad: LaunchpadProject | undefined = location?.currentLaunchpad
  const unlimitedLevel = location?.unlimitedLevel

  const isZeekNode = currentLaunchpad?.supplyAssetId === 'ZEEKNODE'

  const prevAmountRef = useRef<string | undefined>(null)
  const timeoutRef = useRef<any>(null)

  const userLevel = useUnit($tierLevel)
  const allocationLaunchpad = useUnit($allocationLaunchpad)
  const assets = useUnit($assetsListData)
  const FIAsset = assets.find(asset => asset.assetId === 'FI')
  const buyingAsset = assets.find(asset => asset.assetId === currentLaunchpad?.buyingAssetId)
  const stakingContracts = useUnit($allStakingContracts)
  const FIStakingContract = stakingContracts.find(stakingContract => stakingContract.assetId === 'FI')
  const FIStakingContractAmount = FIStakingContract?.amount ? FIStakingContract?.amount - 0.01 : 0
  const stakingPlans = useUnit($stakingPlans)
  const FIPlans = stakingPlans.rollingLeveledPlans

  const assetsCefiExchangeRates = useUnit($assetsCefiExchangeRates)
  const exchangePair = assetsCefiExchangeRates.find(assetsCefiExchangeRate => {
    return (
      assetsCefiExchangeRate.fromAssetId === currentLaunchpad?.buyingAssetId &&
      assetsCefiExchangeRate.toAssetId === 'FI'
    )
  })
  const exchangePairRate = exchangePair?.rate

  const totalPurchasedAmount = isZeekNode
    ? +currentLaunchpad.supplyRaisedAmount
    : +(allocationLaunchpad?.totalPurchasedAmount || 0)

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(STEPS.AMOUNT)
  const [isShowHint, setIsShowHint] = useState(false)
  const [isFetch, setIsFetch] = useState(false)
  const [hintData, setHintData] = useState<HintData>({
    allocationPurchase: 0,
    tierFee: 0,
    lockedFi: 0,
    buyingAssetCount: 0,
    conversionFeeInBuyingAsset: 0,
    buyingAssetId: '',
    tierFeePercent: 0.01,
    targetTier: 1,
    targetFiPlan: null,
    missingFiAmount: 0,
    exchangeInfoData: null,
  })

  const userLevelAllocation = currentLaunchpad?.userLevelAllocations.find(item => item.userLevel === userLevel)

  const formMethods = useForm<Inputs>({ defaultValues })
  const { handleSubmit, watch } = formMethods
  const amountValue = watch('amount')

  const equivalentValue = hintData.allocationPurchase + hintData.tierFee + hintData.buyingAssetCount // + hintData.conversionFeeInBuyingAsset

  const handlePurchase = async () => {
    if (isLoading) return
    if (isFetch) return
    if (!currentLaunchpad) return
    if (+amountValue <= 0) return
    try {
      setIsFetch(true)
      const calculated = await LaunchpadService.calculateAllocationLaunchpad({
        projectUuid: currentLaunchpad.projectId,
        amount: amountValue,
      })
      const allocationPurchase = +amountValue * +currentLaunchpad.buyingAssetPrice
      const tierFee = +calculated.fee || 0 // allocationPurchase * tierFeePercent

      let lockedFi = 0
      let buyingAssetCount = 0
      let conversionFeeInBuyingAsset = 0
      let targetFiPlan = null
      let missingFiAmount = 0
      let exchangeInfoData = null

      if (calculated.currentUserLevel < calculated.targetUserLevel) {
        targetFiPlan = FIPlans.slice().sort((a, b) => +a.minimalTargetPlanAmount - +b.minimalTargetPlanAmount)[
          calculated.targetUserLevel - 1
        ]

        const targetFiPlanAmount = Number(targetFiPlan?.minimalPlanAmount) || 1
        const FIBalance = FIAsset?.availableBalance || 0
        missingFiAmount = +targetFiPlanAmount - FIStakingContractAmount - +FIBalance

        lockedFi = +targetFiPlanAmount - FIStakingContractAmount

        // exchange to FI
        if (missingFiAmount && missingFiAmount > 0) {
          if (exchangePairRate) {
            const exchangeInfoDataForFee = await AssetsServices.exchangeInfoAsset({
              amount: 1,
              from: currentLaunchpad.buyingAssetId,
              to: 'FI',
            })
            const feePercentage =
              +exchangeInfoDataForFee.totalFeeAmount /
                (+exchangeInfoDataForFee.remainingAmount + +exchangeInfoDataForFee.totalFeeAmount) || feeFI

            const missingFiAmountForFee = missingFiAmount / (1 - feePercentage)
            buyingAssetCount = Math.ceil(missingFiAmountForFee / exchangePairRate)
            //TODO: учесть fee за обмен ?? от сервера и учесть отключеный трэйд
            // может отправить за покупкой указав сумму ??

            exchangeInfoData = await AssetsServices.exchangeInfoAsset({
              amount: +buyingAssetCount,
              from: currentLaunchpad.buyingAssetId, // selectedFromAsset?.assetId || '',
              to: 'FI', // selectedToAsset?.assetId || '',
            })

            conversionFeeInBuyingAsset = exchangeInfoData.totalFeeAmount / exchangeInfoData.rate
          } else {
            // TODO: сделать обработку на отсутствие обменной пары
          }
        }
      }
      setHintData({
        allocationPurchase,
        tierFee,
        lockedFi,
        buyingAssetCount,
        conversionFeeInBuyingAsset,
        buyingAssetId: currentLaunchpad.buyingAssetId,
        tierFeePercent: TBDHideId.includes(currentLaunchpad.projectId)
          ? 0
          : tiersFeePercent[calculated.targetUserLevel || userLevel],
        targetTier: calculated.targetUserLevel,
        targetFiPlan,
        missingFiAmount,
        exchangeInfoData,
      })
    } catch (error: any) {
      console.log('calculated-error', error)
      handleError(error)
    } finally {
      setIsFetch(false)
      setIsLoading(false)
    }
  }

  const maxValueAllocationSize = +(userLevelAllocation?.supplyAllocationSize || 0) - totalPurchasedAmount // totalPurchasedAmountUser

  const onSubmit = async (data: any) => {
    if (isZeekNode && +amountValue > +maxValueAllocationSize) return
    if (equivalentValue > +(buyingAsset?.availableBalance || 0)) {
      navigate(pages.PORTFOLIO.path)
    }
    if (+amountValue <= 0) return
    setIsLoading(true)
    await handlePurchase()
    setStep(STEPS.CONFIRM)
  }

  const handleConfirm = async () => {
    if (isLoading) return
    if (!currentLaunchpad) return

    if (equivalentValue > +(buyingAsset?.availableBalance || 0)) {
      navigate(pages.PORTFOLIO.path)
      return
    }

    setIsLoading(true)
    try {
      if (hintData.conversionFeeInBuyingAsset && hintData.buyingAssetCount) {
        const exchangeInfoData = await AssetsServices.exchangeInfoAsset({
          amount: hintData.buyingAssetCount,
          from: currentLaunchpad.buyingAssetId, // selectedFromAsset?.assetId || '',
          to: 'FI', // selectedToAsset?.assetId || '',
        })

        const exchangeData = await AssetsServices.exchangeAsset({
          amount: hintData.buyingAssetCount,
          info: exchangeInfoData,
        })
      }

      if (hintData.lockedFi) {
        await StakingServices.rollingCreate({
          amount: +(hintData.lockedFi ?? 0),
          planId: hintData.targetFiPlan?.id || 4,
        })
      }

      //TODO: обработать недостаток USDT после повышения уровня
      // hintData.allocationPurchase + hintData.tierFee

      await updateEarning()

      const response = await LaunchpadService.createAllocationLaunchpad({
        amount: amountValue,
        projectUuid: currentLaunchpad.projectId,
      })
      await getLaunchpadsFx({ page: '0', size: '2000' })
      await getLaunchpadFx(currentLaunchpad.projectId)
      await getAllocationLaunchpadFx(currentLaunchpad.projectId)
      await myAssetsFx()
      await getAllocationsLaunchpadsFx({ page: '0', size: '2000' })
      setStep(STEPS.SUCCESS)

      // navigate(pages.LAUNCHPAD.path, { state: { isMyInvestments: true } })
    } catch (error) {
      console.log('ERROR-handleConfirm', error)
      handleError(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Установка нового таймера с задержкой
    timeoutRef.current = setTimeout(() => {
      if (amountValue && prevAmountRef.current !== amountValue) {
        handlePurchase()
        prevAmountRef.current = amountValue
      }
    }, 1000)

    if (!amountValue) {
      setHintData({
        allocationPurchase: 0,
        tierFee: 0,
        lockedFi: 0,
        buyingAssetCount: 0,
        conversionFeeInBuyingAsset: 0,
        buyingAssetId: '',
        tierFeePercent: 0.01,
        targetTier: 1,
        targetFiPlan: null,
        missingFiAmount: 0,
        exchangeInfoData: null,
      })
      prevAmountRef.current = ''
    }

    return () => clearTimeout(timeoutRef.current)
  }, [amountValue])

  useEffect(() => {
    if (step === STEPS.CONFIRM) {
      const intervalId = setInterval(() => {
        handlePurchase()
      }, 10000)

      return () => clearInterval(intervalId)
    }
  }, [step])

  const goToMyInvestments = () => {
    navigate(pages.LAUNCHPAD.path, { state: { isMyInvestments: true } })
  }

  const textHelperFI = () => {
    if (!FIStakingContractAmount) {
      return `Click the button to exchange the missing ${hintData.lockedFi} FI from your USDT account and acquire it in earnings, unlocking Tier ${hintData.targetTier} and allowing you to continue with the purchase. Additional FI tokens will be grouped and reset the duration, with your Tier Level updated automatically.`
    }

    if (hintData.buyingAssetCount) {
      return `Click the button to exchange the missing ${hintData.missingFiAmount} FI from your USDT account and acquire ${hintData.lockedFi} FI in earnings, unlocking Tier ${hintData.targetTier} and allowing you to continue with the purchase. Additional FI tokens will be grouped and reset the duration, with your Tier Level updated automatically.`
    }

    if (hintData.missingFiAmount < 0) {
      return `Click the button to acquire the missing ${hintData.lockedFi} FI in earnings, unlocking Tier ${hintData.targetTier} and allowing you to continue with the purchase. Additional FI tokens will be grouped and reset the duration, with your Tier Level updated automatically`
    }
    return 'Error'
  }

  const tierUpdateHint = () => {
    if (!currentLaunchpad) return

    if (TBDHideId.includes(currentLaunchpad.projectId)) {
      return <div className={styles.autoHeight100} />
    }

    // if (isTrue) {
    if (
      unlimitedLevel &&
      maxValueAllocationSize > +currentLaunchpad.supplyAmount - +currentLaunchpad.supplyRaisedAmount &&
      +currentLaunchpad.supplyAmount - +currentLaunchpad.supplyRaisedAmount > 0
    ) {
      return (
        <>
          <div className={styles.height20} />
          <div className={clsx(styles.equivalentText, styles.maxWidth402)}>
            <div>
              IMPORTANT: There are {+currentLaunchpad.supplyAmount - +currentLaunchpad.supplyRaisedAmount}{' '}
              {currentLaunchpad.supplyAssetId} remaining to fully fund the project. Your purchase will upgrade you to{' '}
              <span className={styles.tierText}>Tier {unlimitedLevel}</span>, giving you unlimited allocation.
            </div>
          </div>
          <div className={styles.autoHeight100} />
        </>
      )
    }

    if (maxValueAllocationSize <= 0) {
      return (
        <>
          <div className={styles.height20} />
          <div className={clsx(styles.equivalentText, styles.maxWidth402)}>
            <div>
              You’ve reached your residual allocation amount. You can still continue purchasing via upgrading your Tier
              Level
            </div>
          </div>
          <div className={styles.autoHeight100} />
        </>
      )
    }
    return <div className={styles.autoHeight100} />
  }

  if (step === STEPS.SUCCESS) {
    return (
      <SuccessPairs
        title={'You’ve made a purchase!'}
        description={'We have successfully processed your purchase request.'}
        headerTitle={'Purchase'}
        btnText='See My Investments'
        btnAction={goToMyInvestments}
        backBtnTitle='Launchpad'
        btnIconPosition='right'
      />
    )
  }

  const isInsufficientFunds = equivalentValue > +(buyingAsset?.availableBalance || 0)

  return (
    <div className='page-container-pairs'>
      <HeaderTitle headerTitle={'Purchase'} showBackBtn />

      <div className={styles.contentWrap}>
        {step === STEPS.AMOUNT ? (
          <div className={styles.contentForm}>
            <div className={styles.formHeader}>
              <div className={styles.title}>Purchase</div>
              <div className={styles.description}>Enter the amount of tokens you would like to purchase.</div>
            </div>

            <FormProvider {...formMethods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.inputLabel}>Amount</div>
                {currentLaunchpad ? (
                  <LaunchpadInput
                    currentLaunchpad={currentLaunchpad}
                    formMethods={formMethods}
                    maxValue={maxValueAllocationSize}
                    precision={currentLaunchpad.precision}
                    isError={isInsufficientFunds}
                  />
                ) : null}

                {isInsufficientFunds ? (
                  <div className={styles.errorBlock}>
                    <img src={infoIconError} alt={''} className={styles.errorIcon} />
                    {/* TODO уточнить что отображать */}
                    Insufficient balance: {addCommasToDisplayValue(maxValueAllocationSize.toString(), 2)} $
                    {currentLaunchpad?.supplyAssetId}
                  </div>
                ) : null}

                <div className={styles.height20} />

                <div
                  onMouseLeave={() => setIsShowHint(false)}
                  onMouseEnter={() => setIsShowHint(true)}
                  className={styles.infoBlockWrap}
                >
                  <div className={styles.equivalentText}>
                    Equivalent {currentLaunchpad?.buyingAssetId}:{' '}
                    {addCommasToDisplayValue(equivalentValue.toString(), 2)} {currentLaunchpad?.buyingAssetId}
                  </div>
                  <div className={styles.infoBlockHintWrap}>
                    <img src={infoIcon} alt={''} />
                    {isShowHint ? <LaunchpadCalculatedHint hintData={hintData} /> : null}
                  </div>
                </div>

                <div className={styles.height10} />

                {!unlimitedLevel || userLevel >= unlimitedLevel ? null : (
                  <>
                    <div className={styles.infoBlockWrap}>
                      <div className={styles.infoBlockRow}>
                        <div className={styles.residual}>Your remaining residual allocation</div>
                        <SimpleHint
                          text={
                            'The amount of tokens you are allocated to buy based on your tier level on Pairs Earnings.'
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.height20} />

                    <div className={styles.amount2}>
                      {addCommasToDisplayValue(maxValueAllocationSize.toString(), 2)} ${currentLaunchpad?.supplyAssetId}
                    </div>
                  </>
                )}

                {tierUpdateHint()}

                <button type={'submit'} className={clsx('btn-new big', isInsufficientFunds ? 'red' : 'primary')}>
                  {isLoading ? (
                    <span className='spinner-border' />
                  ) : (
                    <div>
                      {isInsufficientFunds
                        ? 'Deposit'
                        : `${TBDHideId.includes(currentLaunchpad?.projectId || '') ? 'Migrate' : 'Preview Purchase'}`}
                    </div>
                  )}
                </button>
              </form>
            </FormProvider>
          </div>
        ) : null}

        {step === STEPS.CONFIRM ? (
          <div className={styles.contentSummary}>
            <div className={styles.summaryHeaderWrap}>
              <div className={styles.title}>Purchase Preview</div>
              <div className={styles.description}>Make sure the following information is correct</div>
            </div>

            <div className={styles.summaryBody}>
              <div className={styles.divider} />

              <div className={styles.summaryBlock}>
                <div className={styles.summaryBlockRow}>
                  <div className={styles.summaryText}>You will receive</div>
                  <SimpleHint
                    text={`The crypto token rate may change during purchase. Ensure sufficient funds in your account, or you'll need to restart the process with the updated rate.`}
                  />
                </div>
                <div className={styles.summarySubText}>
                  +{addCommasToDisplayValue(amountValue, 2)} {currentLaunchpad?.supplyAssetId}
                </div>
              </div>

              <div className={styles.summaryBlock}>
                <div className={styles.summaryText}>You will pay</div>
                <div className={clsx(styles.summarySubText, isInsufficientFunds && styles.colorRed)}>
                  -{addCommasToDisplayValue(equivalentValue.toString(), 2)} {currentLaunchpad?.buyingAssetId}
                </div>

                {isInsufficientFunds ? (
                  <div className={styles.errorBlock}>
                    <img src={infoIconError} alt={''} className={styles.errorIcon} />
                    Insufficient balance
                  </div>
                ) : null}
              </div>

              {hintData.lockedFi ? (
                <>
                  <div className={styles.summaryBlock}>
                    <div className={styles.summaryText}>FI to be locked</div>
                    <div className={styles.summarySubText}>
                      {addCommasToDisplayValue(hintData.lockedFi.toString(), 6)} FI
                    </div>
                  </div>
                  <div className={styles.divider} />
                  <div className={clsx(styles.summaryText, styles.maxWidth402)}>{textHelperFI()}</div>
                </>
              ) : (
                <div className={styles.divider} />
              )}

              <div className={styles.autoHeight100} />

              <div className={styles.summaryBtnsWrap}>
                <button
                  type='button'
                  onClick={() => setStep(STEPS.AMOUNT)}
                  className={clsx('btn-new grey big', styles.btnBack)}
                  disabled={isLoading}
                >
                  <div className={styles.btnBackIcon}>
                    <TriangleIcon fill={'var(--Deep-Space)'} />
                  </div>
                  <div>Step Back</div>
                </button>

                <button onClick={handleConfirm} className='btn-new primary big'>
                  {isLoading ? (
                    <span className='spinner-border' />
                  ) : (
                    <div>{isInsufficientFunds ? 'Deposit' : 'Confirm & Purchase'}</div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
