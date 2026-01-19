// import { useEffect, useState } from 'react'
// import { FormProvider, useForm } from 'react-hook-form'
// import { useNavigate } from 'react-router-dom'
// import { useUnit } from 'effector-react'
// import clsx from 'clsx'

// import { CommonDropdown, InputAmount, Modal, RequestError, Success, SummaryBlockStake } from 'components'
// import { pages } from 'constant'
// import { EVENT_NAMES, SimpleStakingPlansResponse, StakingServices, useAnalytics } from 'wip/services'
// import { Currencies } from 'wip/stores'
// import { updateEarning } from 'wip/stores/init'
// import { $stakingPlans, $tierLevel } from 'model/cefi-stacking'
// import dangerOrange from 'assets/icons/danger-orange.svg'

// import { $assetsRates } from '../../../model/cef-rates-coingecko'
// import { $assetsListData } from '../../../model/cefi-combain-assets-data'
// import { $currency } from '../../../model/currency'
// import { getBalanceString } from '../../../utils'
// import styles from './styles.module.scss'

// type Inputs = {
//   amount: string
// }

// const defaultValues = {
//   amount: '',
// }

// //TODO old DELETE ?
// function NewEarningModal() {
//   const assets = useUnit($assetsListData)
//   const currency = useUnit($currency)
//   const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'
//   const ratesRaw = useUnit($assetsRates)
//   const stakingPlans = useUnit($stakingPlans)

//   // //TODO: refactor for Launchpad
//   // const tierLimits = {
//   //   '1': currency === '$' ? 100 : 93,
//   //   '2': currency === '$' ? 250 : 232,
//   //   '3': currency === '$' ? 1000 : 926,
//   //   '4': currency === '$' ? 2000 : 1852,
//   // }

//   const tierLevel = useUnit($tierLevel)
//   // @ts-ignore
//   const tierLimit = 0 // tierLimits[tierLevel] || 1

//   const { myLogEvent } = useAnalytics()
//   const { simplePlans, rollingLeveledPlans } = stakingPlans
//   const navigate = useNavigate()

//   const methods = useForm<Inputs>({ defaultValues })
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     watch,
//     setValue,
//     clearErrors,
//     setError,
//   } = methods

//   const watchAmount = watch('amount').replace(',', '.')

//   const [contract, setContract] = useState<SimpleStakingPlansResponse | null>(null)
//   const [isCurrency, setIsCurrency] = useState(false)
//   const [isReadyStack, setIsReadyStack] = useState(false)
//   const [requestError, setRequestError] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [isSuccessful, setIsSuccessful] = useState(false)

//   useEffect(() => {
//     setValue('amount', '')
//     clearErrors()
//   }, [contract])

//   useEffect(() => {
//     if (requestError) {
//       setRequestError('')
//     }
//   }, [watchAmount])

//   const asset = assets.find(token => token.assetId === contract?.assetId)
//   const currencySymbol = currency.symbol === Currencies.USD ? 'USD' : 'EUR'
//   const assetRate = ratesRaw?.find(
//     assetRateRaw => assetRateRaw.fromAssetId === asset?.assetId && assetRateRaw.toAssetId === currencySymbol
//   )
//   const assetAmountLimits = +watchAmount * (asset?.[currencyType]?.price || 0) || 0

//   const validateAmount = (): boolean => {
//     if (+watchAmount > 0 && tierLimit > assetAmountLimits) {
//       // !requestError && setRequestError(`min ${tierLimit} ${currencySymbol}`)
//       !requestError && setRequestError(`Minimal earning amount is ${tierLimit} ${currencySymbol}`)
//       return true
//     }
//     return !asset || !Number(asset.availableBalance) || errors.amount?.type === 'validate'
//   }

//   const handleConfirm = async (): Promise<void> => {
//     // eslint-disable-next-line no-useless-return
//     if (validateAmount()) return

//     if (+watchAmount < Number(contract?.minimalStakingAmount || 0)) {
//       setError('amount', { message: 'min amount', type: 'min' })
//       return
//     }

//     setIsReadyStack(true)
//     if (isReadyStack && !!contract) {
//       setIsLoading(true)
//       try {
//         const stakingService = ['FI', 'PAIRS'].includes(contract.assetId)
//           ? StakingServices.rollingCreate
//           : StakingServices.simpleCreate
//         await stakingService({
//           amount: +(isCurrency ? getBalanceString(+watchAmount / (assetRate?.data.currentPrice || 1), 2) : watchAmount),
//           planId: contract.id,
//         })
//         await updateEarning()

//         if (contract.assetId === 'XRP') {
//           myLogEvent(EVENT_NAMES.WEB_EARN_XRP, { amount: +watchAmount })
//         }

//         setIsSuccessful(true)
//       } catch (error: any) {
//         console.log('ERROR-handleSimpleStack', error)
//         setRequestError(error?.code || error.message)
//       }
//       setIsLoading(false)
//     }
//   }

//   const itemComponent = (plan: SimpleStakingPlansResponse) => {
//     if (!plan) return <div className={styles.dropDownPlaceholderText}>Choose from the list</div>

//     const assetComponent = assets.find(assetItem => assetItem.assetId === plan.assetId)
//     return (
//       <div
//         key={plan.assetId}
//         onClick={() => {
//           setContract(plan)
//         }}
//         className={clsx(styles.dropDownSelectedRow, styles.networksDropdownItem)}
//       >
//         <div className={styles.dropDownRowIconWrap}>
//           {assetComponent && <img src={assetComponent.icon} className={styles.assetIcon} alt='' />}
//           <div className={styles.assetIdText}>{plan.assetId}</div>
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center' }}>
//           <div className={styles.dropDownRowText}>{parseFloat(plan.stakingApyPercent.toString())}% APY</div>
//           <div style={{ width: 5, height: 5, borderRadius: 5, backgroundColor: '#445374', margin: 5 }} />
//           <div className={styles.dropDownRowText} style={{ marginRight: 20 }}>
//             {plan.stakingPeriod} Days
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (isSuccessful) {
//     return (
//       <div style={{ position: 'absolute', top: 0, right: 0 }}>
//         <Success text='Earning Successfully Setup' />
//       </div>
//     )
//   }

//   return (
//     <div className={styles.container}>
//       <FormProvider {...methods}>
//         <form className={styles.mobileForm} onSubmit={handleSubmit(handleConfirm)}>
//           <div className={styles.content}>
//             {isReadyStack ? (
//               <>
//                 <div className={styles.title}>New Earning Summary</div>
//                 {/* <SummaryBlockStake
//                   amount={watchAmount}
//                   assetRate={assetRate}
//                   targetPlan={contract}
//                   currentStakingApyPercent={contract?.stakingApyPercent}
//                   maxOtherApiPercent={contract?.stakingApyPercent}
//                   isCurrency={isCurrency}
//                 /> */}
//                 <div className={styles.attentionText}>
//                   <img className={styles.attentionIcon} alt='' src={dangerOrange} />
//                   <div>By confirming a new lock group will be created under your current Tier.</div>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className={styles.title}>New Earning</div>
//                 <div className={styles.enterAmount}>Choose an Asset</div>
//                 <CommonDropdown
//                   data={[
//                     ...simplePlans.filter(plan => plan.assetId !== contract?.assetId && plan.assetId !== null),
//                     ...rollingLeveledPlans,
//                   ]}
//                   selectedData={contract}
//                   itemComponent={itemComponent}
//                   setSelectedData={setContract}
//                 />
//                 <div style={{ height: 20 }} />

//                 {asset && (
//                   <InputAmount
//                     errors={errors}
//                     asset={asset}
//                     register={register}
//                     assetRate={assetRate}
//                     setValue={setValue}
//                     watchAmount={watchAmount}
//                     isCurrency={isCurrency}
//                     setIsCurrency={setIsCurrency}
//                     clearErrors={clearErrors}
//                     minAmountAsset={contract?.minimalStakingAmount}
//                   />
//                 )}
//               </>
//             )}

//             {!asset && <div style={{ height: 171 }} />}

//             {!isReadyStack && (
//               <div className={styles.tierRateWrap}>
//                 <div className={styles.tierRateTitle}>Your Tier Rate</div>
//                 <div className={styles.tierRateApy}>{Number(contract?.stakingApyPercent) || '-'}% APY</div>
//               </div>
//             )}

//             {asset && !isReadyStack && (
//               <div className={styles.errorBlock}>
//                 <div style={{ marginBottom: 22 }}>
//                   {validateAmount() ? 'Not enough balance. Get coin to be able to earn interest.' : ''}
//                 </div>
//               </div>
//             )}

//             {asset && (
//               <button
//                 type='submit'
//                 className='btn-new primary big'
//                 style={validateAmount() ? { backgroundColor: 'red' } : {}}
//                 onClick={() => {
//                   if (validateAmount()) {
//                     navigate(pages.PORTFOLIO.path)
//                     Modal.close()
//                   }
//                 }}
//               >
//                 {/* eslint-disable-next-line no-nested-ternary */}
//                 {isLoading ? (
//                   <span className='spinner-border' />
//                 ) : // eslint-disable-next-line no-nested-ternary
//                 isReadyStack ? (
//                   'Lock'
//                 ) : validateAmount() ? (
//                   'Get Coin'
//                 ) : (
//                   'Continue'
//                 )}
//               </button>
//             )}

//             {isReadyStack && (
//               <button
//                 className={clsx('btn-new', 'grey', 'big', styles.backBtn)}
//                 onClick={e => {
//                   e.preventDefault()
//                   setIsReadyStack(false)
//                   setRequestError('')
//                 }}
//               >
//                 Back
//               </button>
//             )}

//             {requestError ? <RequestError requestError={requestError} /> : null}

//             <div style={{ height: 20 }} />
//           </div>
//         </form>
//       </FormProvider>
//     </div>
//   )
// }
