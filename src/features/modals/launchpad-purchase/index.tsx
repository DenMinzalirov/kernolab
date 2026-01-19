// import { useEffect, useRef, useState } from 'react'
// import { FormProvider, useForm } from 'react-hook-form'
// import { useNavigate } from 'react-router-dom'
// import { useUnit } from 'effector-react'
// import clsx from 'clsx'

// import { handleError } from 'utils/error-handler'

// import backSymbol from '../../../assets/icons/backSymbol.svg'
// import infoIcon from '../../../assets/icons/info-icon.svg'
// import { Modal } from '../../../components'
// import { LaunchpadCalculatedHint } from '../../../components/launchpad-calculated-hint'
// import { LaunchpadInput } from '../../../components/launchpad-input'
// import { SimpleHint } from '../../../components/simple-hint'
// import { TBDHideId } from '../../../config'
// import { pages } from '../../../constant'
// import { $assetsCefiExchangeRates } from '../../../model/cef-rates-exchange'
// import { $assetsListData } from '../../../model/cefi-combain-assets-data'
// import { myAssetsFx } from '../../../model/cefi-my-assets-list'
// import { $allStakingContracts, $stakingPlans, $tierLevel } from '../../../model/cefi-stacking'
// import {
//   $allocationLaunchpad,
//   getAllocationLaunchpadFx,
//   getAllocationsLaunchpadsFx,
//   getLaunchpadFx,
//   getLaunchpadsFx,
// } from '../../../model/launchpads'
// import { addCommasToDisplayValue } from '../../../utils/add-commas-to-display-value'
// import {
//   AssetsServices,
//   ExchangeInfo,
//   RollingLeveledStakingPlansResponse,
//   StakingServices,
// } from '../../../wip/services'
// import { LaunchpadProject, LaunchpadService } from '../../../wip/services/launchpads'
// import { updateEarning } from '../../../wip/stores/init'
// import styles from './styles.module.scss'

// type Inputs = {
//   amount: string
// }

// const defaultValues = {
//   amount: '',
// }

// type Props = {
//   currentLaunchpad: LaunchpadProject
//   unlimitedLevel: number | null
// }

// export type HintData = {
//   allocationPurchase: number
//   tierFee: number
//   lockedFi: number
//   buyingAssetCount: number
//   conversionFeeInBuyingAsset: number
//   buyingAssetId: string
//   tierFeePercent: number
//   targetTier: number
//   targetFiPlan: RollingLeveledStakingPlansResponse | null
//   missingFiAmount: number
//   exchangeInfoData: ExchangeInfo | null
// }

// const STEPS = {
//   AMOUNT: 'AMOUNT',
//   CONFIRM: 'CONFIRM',
//   SUCCESS: 'SUCCESS',
// }

// // TODO: вывести в конфиг
// const tiersFeePercent: Record<string, number> = {
//   0: 0.01,
//   1: 0.01,
//   2: 0.0075,
//   3: 0.0025,
//   4: 0,
// }

// const feeFI = 0.045 // 4.5% fee for USDT->FI

// //TODO old DELETE

// function LaunchpadPurchaseModal({ currentLaunchpad, unlimitedLevel }: Props) {
//   const isZeekNode = currentLaunchpad.supplyAssetId === 'ZEEKNODE'

//   const prevAmountRef = useRef<string | undefined>()
//   const timeoutRef = useRef<any>(null)
//   const navigate = useNavigate()

//   const userLevel = useUnit($tierLevel)
//   const allocationLaunchpad = useUnit($allocationLaunchpad)
//   const assets = useUnit($assetsListData)
//   const FIAsset = assets.find(asset => asset.assetId === 'FI')
//   const buyingAsset = assets.find(asset => asset.assetId === currentLaunchpad.buyingAssetId)
//   const stakingContracts = useUnit($allStakingContracts)
//   const FIStakingContract = stakingContracts.find(stakingContract => stakingContract.assetId === 'FI')
//   const FIStakingContractAmount = FIStakingContract?.amount ? FIStakingContract?.amount - 0.01 : 0
//   const stakingPlans = useUnit($stakingPlans)
//   const FIPlans = stakingPlans.rollingLeveledPlans

//   const assetsCefiExchangeRates = useUnit($assetsCefiExchangeRates)
//   const exchangePair = assetsCefiExchangeRates.find(assetsCefiExchangeRate => {
//     return (
//       assetsCefiExchangeRate.fromAssetId === currentLaunchpad.buyingAssetId && assetsCefiExchangeRate.toAssetId === 'FI'
//     )
//   })
//   const exchangePairRate = exchangePair?.rate

//   const totalPurchasedAmount = isZeekNode
//     ? +currentLaunchpad.supplyRaisedAmount
//     : +(allocationLaunchpad?.totalPurchasedAmount || 0)

//   const [isLoading, setIsLoading] = useState(false)
//   const [step, setStep] = useState(STEPS.AMOUNT)
//   const [isShowHint, setIsShowHint] = useState(false)
//   const [isFetch, setIsFetch] = useState(false)
//   const [hintData, setHintData] = useState<HintData>({
//     allocationPurchase: 0,
//     tierFee: 0,
//     lockedFi: 0,
//     buyingAssetCount: 0,
//     conversionFeeInBuyingAsset: 0,
//     buyingAssetId: '',
//     tierFeePercent: 0.01,
//     targetTier: 1,
//     targetFiPlan: null,
//     missingFiAmount: 0,
//     exchangeInfoData: null,
//   })

//   const userLevelAllocation = currentLaunchpad.userLevelAllocations.find(item => item.userLevel === userLevel)

//   const formMethods = useForm<Inputs>({ defaultValues })
//   const { handleSubmit, watch } = formMethods
//   const amountValue = watch('amount')

//   const equivalentValue = hintData.allocationPurchase + hintData.tierFee + hintData.buyingAssetCount // + hintData.conversionFeeInBuyingAsset

//   const handlePurchase = async () => {
//     if (isLoading) return
//     if (isFetch) return
//     if (+amountValue <= 0) return
//     try {
//       setIsFetch(true)
//       const calculated = await LaunchpadService.calculateAllocationLaunchpad({
//         projectUuid: currentLaunchpad.projectId,
//         amount: amountValue,
//       })
//       const allocationPurchase = +amountValue * +currentLaunchpad.buyingAssetPrice
//       const tierFee = +calculated.fee || 0 // allocationPurchase * tierFeePercent

//       let lockedFi = 0
//       let buyingAssetCount = 0
//       let conversionFeeInBuyingAsset = 0
//       let targetFiPlan = null
//       let missingFiAmount = 0
//       let exchangeInfoData = null

//       if (calculated.currentUserLevel < calculated.targetUserLevel) {
//         targetFiPlan = FIPlans.slice().sort((a, b) => +a.minimalTargetPlanAmount - +b.minimalTargetPlanAmount)[
//           calculated.targetUserLevel - 1
//         ]

//         const targetFiPlanAmount = Number(targetFiPlan?.minimalPlanAmount) || 1
//         const FIBalance = FIAsset?.availableBalance || 0
//         missingFiAmount = +targetFiPlanAmount - FIStakingContractAmount - +FIBalance

//         lockedFi = +targetFiPlanAmount - FIStakingContractAmount

//         // exchange to FI
//         if (missingFiAmount && missingFiAmount > 0) {
//           if (exchangePairRate) {
//             const exchangeInfoDataForFee = await AssetsServices.exchangeInfoAsset({
//               amount: 1,
//               from: currentLaunchpad.buyingAssetId,
//               to: 'FI',
//             })
//             const feePercentage =
//               +exchangeInfoDataForFee.totalFeeAmount /
//                 (+exchangeInfoDataForFee.remainingAmount + +exchangeInfoDataForFee.totalFeeAmount) || feeFI

//             const missingFiAmountForFee = missingFiAmount / (1 - feePercentage)
//             buyingAssetCount = Math.ceil(missingFiAmountForFee / exchangePairRate)
//             //TODO: учесть fee за обмен ?? от сервера и учесть отключеный трэйд
//             // может отправить за покупкой указав сумму ??

//             exchangeInfoData = await AssetsServices.exchangeInfoAsset({
//               amount: +buyingAssetCount,
//               from: currentLaunchpad.buyingAssetId, // selectedFromAsset?.assetId || '',
//               to: 'FI', // selectedToAsset?.assetId || '',
//             })

//             conversionFeeInBuyingAsset = exchangeInfoData.totalFeeAmount / exchangeInfoData.rate
//           } else {
//             // TODO: сделать обработку на отсутствие обменной пары
//           }
//         }
//       }
//       setHintData({
//         allocationPurchase,
//         tierFee,
//         lockedFi,
//         buyingAssetCount,
//         conversionFeeInBuyingAsset,
//         buyingAssetId: currentLaunchpad.buyingAssetId,
//         tierFeePercent: TBDHideId.includes(currentLaunchpad.projectId)
//           ? 0
//           : tiersFeePercent[calculated.targetUserLevel || userLevel],
//         targetTier: calculated.targetUserLevel,
//         targetFiPlan,
//         missingFiAmount,
//         exchangeInfoData,
//       })
//     } catch (error: any) {
//       console.log('calculated-error', error)
//       handleError(error)
//     } finally {
//       setIsFetch(false)
//       setIsLoading(false)
//     }
//   }

//   const maxValueAllocationSize = +(userLevelAllocation?.supplyAllocationSize || 0) - totalPurchasedAmount // totalPurchasedAmountUser

//   const onSubmit = async (data: any) => {
//     if (isZeekNode && +amountValue > +maxValueAllocationSize) return
//     if (equivalentValue > +(buyingAsset?.availableBalance || 0)) {
//       navigate(pages.PORTFOLIO.path)
//       Modal.close()
//     }
//     if (+amountValue <= 0) return
//     setIsLoading(true)
//     await handlePurchase()
//     setStep(STEPS.CONFIRM)
//   }

//   const handleConfirm = async () => {
//     if (isLoading) return

//     if (equivalentValue > +(buyingAsset?.availableBalance || 0)) {
//       navigate(pages.PORTFOLIO.path)
//       Modal.close()
//       return
//     }

//     setIsLoading(true)
//     try {
//       if (hintData.conversionFeeInBuyingAsset && hintData.buyingAssetCount) {
//         const exchangeInfoData = await AssetsServices.exchangeInfoAsset({
//           amount: hintData.buyingAssetCount,
//           from: currentLaunchpad.buyingAssetId, // selectedFromAsset?.assetId || '',
//           to: 'FI', // selectedToAsset?.assetId || '',
//         })
//         // console.log('exchangeInfoData', exchangeInfoData)

//         const exchangeData = await AssetsServices.exchangeAsset({
//           amount: hintData.buyingAssetCount,
//           info: exchangeInfoData,
//         })
//         // console.log('exchangeData', exchangeData)
//       }

//       if (hintData.lockedFi) {
//         await StakingServices.rollingCreate({
//           amount: +(hintData.lockedFi ?? 0),
//           planId: hintData.targetFiPlan?.id || 4,
//         })
//       }

//       //TODO: обработать недостаток USDT после повышения уровня
//       // hintData.allocationPurchase + hintData.tierFee

//       await updateEarning()

//       const response = await LaunchpadService.createAllocationLaunchpad({
//         amount: amountValue,
//         projectUuid: currentLaunchpad.projectId,
//       })
//       // console.log('response', response)
//       await getLaunchpadsFx({ page: '0', size: '2000' })
//       await getLaunchpadFx(currentLaunchpad.projectId)
//       await getAllocationLaunchpadFx(currentLaunchpad.projectId)
//       await myAssetsFx()
//       await getAllocationsLaunchpadsFx({ page: '0', size: '2000' })
//       setStep(STEPS.SUCCESS)

//       navigate(pages.LAUNCHPAD.path, { state: { isMyInvestments: true } })
//     } catch (error) {
//       console.log('ERROR-handleConfirm', error)
//       handleError(error)
//     }
//     setIsLoading(false)
//   }

//   useEffect(() => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current)
//     }

//     // Установка нового таймера с задержкой
//     timeoutRef.current = setTimeout(() => {
//       if (amountValue && prevAmountRef.current !== amountValue) {
//         handlePurchase()
//         prevAmountRef.current = amountValue
//       }
//     }, 1000)

//     if (!amountValue) {
//       setHintData({
//         allocationPurchase: 0,
//         tierFee: 0,
//         lockedFi: 0,
//         buyingAssetCount: 0,
//         conversionFeeInBuyingAsset: 0,
//         buyingAssetId: '',
//         tierFeePercent: 0.01,
//         targetTier: 1,
//         targetFiPlan: null,
//         missingFiAmount: 0,
//         exchangeInfoData: null,
//       })
//       prevAmountRef.current = ''
//     }

//     return () => clearTimeout(timeoutRef.current)
//   }, [amountValue])

//   useEffect(() => {
//     if (step === STEPS.CONFIRM) {
//       // console.log('STEPCONFIRM')
//       const intervalId = setInterval(() => {
//         // console.log('INTERVAL')
//         handlePurchase()
//       }, 10000)

//       return () => clearInterval(intervalId)
//     }
//   }, [step])

//   const goToMyInvestments = () => {
//     navigate(pages.LAUNCHPAD.path, { state: { isMyInvestments: true } })
//     Modal.close()
//   }

//   const textHelperFI = () => {
//     if (!FIStakingContractAmount) {
//       return `Click the button to exchange the missing ${hintData.lockedFi} FI from your USDT account and acquire it in earnings, unlocking Tier ${hintData.targetTier} and allowing you to continue with the purchase. Additional FI tokens will be grouped and reset the duration, with your Tier Level updated automatically.`
//     }

//     if (hintData.buyingAssetCount) {
//       return `Click the button to exchange the missing ${hintData.missingFiAmount} FI from your USDT account and acquire ${hintData.lockedFi} FI in earnings, unlocking Tier ${hintData.targetTier} and allowing you to continue with the purchase. Additional FI tokens will be grouped and reset the duration, with your Tier Level updated automatically.`
//     }

//     if (hintData.missingFiAmount < 0) {
//       return `Click the button to acquire the missing ${hintData.lockedFi} FI in earnings, unlocking Tier ${hintData.targetTier} and allowing you to continue with the purchase. Additional FI tokens will be grouped and reset the duration, with your Tier Level updated automatically`
//     }
//     return 'Error'
//   }

//   const tierUpdateHint = () => {
//     if (TBDHideId.includes(currentLaunchpad.projectId)) {
//       return <div style={{ height: 90 }} />
//     }

//     if (
//       unlimitedLevel &&
//       maxValueAllocationSize > +currentLaunchpad.supplyAmount - +currentLaunchpad.supplyRaisedAmount &&
//       +currentLaunchpad.supplyAmount - +currentLaunchpad.supplyRaisedAmount > 0
//     ) {
//       return (
//         <div
//           className={styles.equivalentText}
//           style={{ maxWidth: 415, height: 90, display: 'flex', alignItems: 'center' }}
//         >
//           <div>
//             <span style={{ fontWeight: 700 }}>IMPORTANT:</span> There are{' '}
//             {+currentLaunchpad.supplyAmount - +currentLaunchpad.supplyRaisedAmount} {currentLaunchpad.supplyAssetId}{' '}
//             remaining to fully fund the project. Your purchase will upgrade you to{' '}
//             <span style={{ fontWeight: 700 }}>Tier {unlimitedLevel}</span>, giving you unlimited allocation.
//           </div>
//         </div>
//       )
//     }

//     if (maxValueAllocationSize <= 0) {
//       return (
//         <div
//           className={styles.equivalentText}
//           style={{ maxWidth: 415, height: 90, display: 'flex', alignItems: 'center' }}
//         >
//           <div>
//             <span style={{ fontWeight: 700 }}>You’ve reached your residual allocation amount.</span> You can still
//             continue purchasing via upgrading your Tier Level
//           </div>
//         </div>
//       )
//     }
//     return <div style={{ height: 90 }} />
//   }

//   return (
//     <div
//       style={{
//         display: 'flex',
//         flexDirection: 'column',
//         padding: '54px 60px',
//         gap: 90,
//         minWidth: 535,
//         boxSizing: 'border-box',
//       }}
//     >
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 53 }}>
//         {step === STEPS.AMOUNT ? (
//           <>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//               <div className={styles.title}>Purchase</div>
//               <div className={styles.description}>Enter the amount of tokens you would like to purchase.</div>
//             </div>

//             <FormProvider {...formMethods}>
//               <form onSubmit={handleSubmit(onSubmit)}>
//                 <LaunchpadInput
//                   currentLaunchpad={currentLaunchpad}
//                   formMethods={formMethods}
//                   maxValue={maxValueAllocationSize}
//                   precision={currentLaunchpad.precision}
//                 />
//                 <div style={{ height: 20 }} />
//                 <div
//                   onMouseLeave={() => setIsShowHint(false)}
//                   onMouseEnter={() => setIsShowHint(true)}
//                   style={{ display: 'flex', gap: 4, alignItems: 'center' }}
//                 >
//                   <div className={styles.equivalentText}>
//                     Equivalent {currentLaunchpad.buyingAssetId}:{' '}
//                     {addCommasToDisplayValue(equivalentValue.toString(), 2)} {currentLaunchpad.buyingAssetId}
//                   </div>
//                   <div style={{ position: 'relative', cursor: 'pointer', minHeight: 22 }}>
//                     <img src={infoIcon} alt={''} />
//                     {isShowHint ? <LaunchpadCalculatedHint hintData={hintData} /> : null}
//                   </div>
//                   {equivalentValue > +(buyingAsset?.availableBalance || 0) ? (
//                     <div className={styles.equivalentText} style={{ color: 'red' }}>
//                       Insufficient balance
//                     </div>
//                   ) : null}
//                 </div>
//                 <div style={{ height: 10 }} />
//                 {!unlimitedLevel || userLevel >= unlimitedLevel ? null : (
//                   <>
//                     <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                         <div className={styles.residual}>Your remaining residual allocation</div>
//                         <SimpleHint
//                           text={`The amount of tokens you are allocated to buy based on your tier level on Pairs Earnings.`}
//                         />
//                       </div>
//                     </div>
//                     <div style={{ height: 12 }} />
//                     <div className={styles.amount2}>
//                       {addCommasToDisplayValue(maxValueAllocationSize.toString(), 2)} ${currentLaunchpad.supplyAssetId}
//                     </div>
//                   </>
//                 )}
//                 {tierUpdateHint()}
//                 <button
//                   type={'submit'}
//                   className={clsx(
//                     'btn-new',
//                     equivalentValue > +(buyingAsset?.availableBalance || 0) ? 'red' : 'primary'
//                   )}
//                 >
//                   {isLoading ? (
//                     <span className='spinner-border' />
//                   ) : (
//                     <div>
//                       {equivalentValue > +(buyingAsset?.availableBalance || 0)
//                         ? 'Deposit'
//                         : `${TBDHideId.includes(currentLaunchpad.projectId) ? 'Migrate' : 'Preview Purchase'}`}
//                     </div>
//                   )}
//                 </button>
//               </form>
//             </FormProvider>
//           </>
//         ) : null}

//         {step === STEPS.CONFIRM ? (
//           <>
//             {/*<div style={{ height: 40 }} />*/}
//             <div className={styles.titleWrap} style={{ marginTop: 40 }}>
//               <div onClick={() => setStep(STEPS.AMOUNT)} className={styles.backBtn}>
//                 <img src={backSymbol} alt={''} />
//                 {' Back'}
//               </div>
//               <div className={styles.title}>Purchase</div>
//               <div className={styles.description}>Enter the amount of tokens you would like to purchase.</div>
//             </div>
//             <div className={styles.titleWrap} style={{ gap: 23 }}>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                   <div className={styles.description}>You will receive</div>
//                   <SimpleHint
//                     text={`The crypto token rate may change during purchase. Ensure sufficient funds in your account, or you'll need to restart the process with the updated rate.`}
//                   />
//                 </div>
//                 <div className={styles.title}>
//                   +{addCommasToDisplayValue(amountValue, 2)} {currentLaunchpad.supplyAssetId}
//                 </div>
//               </div>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
//                 <div className={styles.description}>You will pay</div>
//                 <div
//                   className={styles.title}
//                   style={{ color: equivalentValue > +(buyingAsset?.availableBalance || 0) ? '#FF3B30' : 'inherit' }}
//                 >
//                   -{addCommasToDisplayValue(equivalentValue.toString(), 2)} {currentLaunchpad.buyingAssetId}
//                 </div>
//                 {equivalentValue > +(buyingAsset?.availableBalance || 0) ? (
//                   <div className={styles.description} style={{ color: '#FF3B30' }}>
//                     Insufficient balance
//                   </div>
//                 ) : null}
//               </div>
//               {hintData.lockedFi ? (
//                 <>
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
//                     <div className={styles.description}>FI to be locked</div>
//                     <div className={styles.title}>{addCommasToDisplayValue(hintData.lockedFi.toString(), 6)} FI</div>
//                   </div>
//                   <div className={styles.description} style={{ maxWidth: 415 }}>
//                     {textHelperFI()}
//                   </div>
//                 </>
//               ) : (
//                 <div style={{ height: 50 }} />
//               )}

//               <button onClick={handleConfirm} className='btn-new primary'>
//                 {isLoading ? (
//                   <span className='spinner-border' />
//                 ) : (
//                   <div>{equivalentValue > +(buyingAsset?.availableBalance || 0) ? 'Deposit' : 'Confirm'}</div>
//                 )}
//               </button>
//             </div>
//           </>
//         ) : null}

//         {step === STEPS.SUCCESS ? (
//           <>
//             <div className={styles.titleWrap}>
//               <div className={styles.title}>You’ve made a purchase!</div>
//               <div className={styles.description}>We have successfully processed your purchase request.</div>
//             </div>
//             <div>
//               <button onClick={() => Modal.close()} className='btn-new primary'>
//                 {isLoading ? <span className='spinner-border' /> : <div>Close</div>}
//               </button>
//               <button className='btn-new transparent'>
//                 {isLoading ? (
//                   <span className='spinner-border' />
//                 ) : (
//                   <div onClick={goToMyInvestments}>See my investments</div>
//                 )}
//               </button>
//             </div>
//           </>
//         ) : null}
//       </div>
//     </div>
//   )
// }
