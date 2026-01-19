// import { Dispatch, SetStateAction, useState } from 'react'
// import { FormProvider, useForm } from 'react-hook-form'
// import { NavLink } from 'react-router-dom'
// import { useUnit } from 'effector-react'
// import clsx from 'clsx'

// import { handleError } from 'utils/error-handler'

// import dangerOrange from '../../../assets/icons/danger-orange.svg'
// import { InputAmount, RequestError, Success } from '../../../components'
// import { HELP_LINKS } from '../../../config'
// import { $assetsRates } from '../../../model/cef-rates-coingecko'
// import { $assetsListData } from '../../../model/cefi-combain-assets-data'
// import { $campaignStakingContracts, $stakingPlans } from '../../../model/cefi-stacking'
// import { $currency } from '../../../model/currency'
// import { getBalanceString } from '../../../utils'
// import { StakingCampaignContractResponse, StakingCampaignResponse, StakingServices } from '../../../wip/services'
// import { updateEarning } from '../../../wip/stores/init'
// // import { NoSuperchargeEvents } from './no-supercharge-events'
// import styles from './styles.module.scss'
// import { SuperchargeItem } from './supercharge-item'

// type Props = {
//   setIsSupercharge: Dispatch<SetStateAction<boolean>>
//   stakeItem?: StakingCampaignContractResponse
// }

// type Inputs = {
//   amount: string
// }

// const defaultValues = {
//   amount: '',
// }

// //TODO old DELETE
// function SuperchargeList({ setIsSupercharge, stakeItem }: Props) {
//   const currency = useUnit($currency)
//   const assets = useUnit($assetsListData)
//   const currencyType = currency.type.toLowerCase() as 'eur' | 'usd'
//   const ratesRaw = useUnit($assetsRates)

//   const superChargeListContracts = useUnit($campaignStakingContracts)
//   const stakingPlans = useUnit($stakingPlans)
//   const campaignPlans = stakingPlans?.campaignPlans || []

//   let preparedPlan: StakingCampaignResponse | undefined

//   if (stakeItem) {
//     preparedPlan = campaignPlans.find(plan => plan.id === stakeItem.campaignId)
//   }

//   const [campaignPlanForStake, setCampaignPlanForStake] = useState<StakingCampaignResponse | null>(preparedPlan || null)
//   const [isCurrency, setIsCurrency] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [isReadyStack, setIsReadyStack] = useState(false)
//   const [errorAmountMsg, setErrorAmountMsg] = useState('')
//   const [requestError, setRequestError] = useState('')
//   const [isSuccessful, setIsSuccessful] = useState(false)

//   const assetRate = ratesRaw?.find(
//     assetRateRaw =>
//       assetRateRaw.fromAssetId === campaignPlanForStake?.assetId && assetRateRaw.toAssetId === currency.type
//   )

//   const methods = useForm<Inputs>({ defaultValues })
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     watch,
//     setValue,
//     clearErrors,
//   } = methods

//   const watchAmount = watch('amount').replace(',', '.')

//   const handleConfirm = () => {
//     if (campaignPlanForStake && +watchAmount < +campaignPlanForStake?.minimalStakingAmount) {
//       setErrorAmountMsg(
//         `The amount entered is below the minimum required ${getBalanceString(
//           +campaignPlanForStake.minimalStakingAmount,
//           4
//         )} for staking.`
//       )
//       return
//     }

//     if (!isReadyStack) {
//       setIsReadyStack(true)
//       return
//     }
//   }

//   const handleLock = async () => {
//     setIsLoading(true)
//     try {
//       const isHavePlanOnStake = superChargeListContracts.find(
//         contract => contract.campaignId === campaignPlanForStake?.id
//       )

//       // if (stakeItem || isHavePlanOnStake) {
//       //   const data = stakeItem || isHavePlanOnStake
//       //   await StakingServices.campaignUpdate({
//       //     contractId: data!.id,
//       //     campaignId: data!.campaignId,
//       //     userStakingAmount: +data!.userStakingAmount + +watchAmount,
//       //   })
//       // } else {
//       await StakingServices.campaignCreate({
//         planId: +campaignPlanForStake!.id,
//         amount: +watchAmount,
//       })
//       // }

//       await updateEarning()

//       setIsSuccessful(true)
//     } catch (error: any) {
//       console.error('Campaign lock', error)
//       const message = handleError(error, true)
//       setRequestError(message || '')
//     }
//     setIsLoading(false)
//   }

//   if (isSuccessful) {
//     return (
//       <div style={{ flexGrow: 1, marginLeft: -60, marginTop: -60 }}>
//         <Success text='Supercharge Setup Successfully' />
//       </div>
//     )
//   }

//   if (isReadyStack && campaignPlanForStake) {
//     return (
//       <>
//         <div className={styles.title}>Supercharge {campaignPlanForStake.assetId} Summary</div>
//         <div className={styles.containerModal} style={{ maxWidth: 438, alignSelf: 'center' }}>
//           <div className={styles.summaryBlockTitle}>Amount</div>
//           <div className={styles.cryptoAmount}>
//             {campaignPlanForStake.assetId} {watchAmount}
//           </div>
//           <div className={styles.currencyAmount}>
//             {currency.symbol}{' '}
//             {isCurrency ? watchAmount : getBalanceString(+watchAmount * (assetRate?.data.currentPrice || 1), 2)}
//           </div>
//           <div className={styles.conversion}>
//             Conversion Rate: 1 {assetRate?.fromAssetId} = {currency.symbol} {assetRate?.data.currentPrice}
//           </div>
//           <div className={styles.divider} />
//           <div className={styles.summaryBlockTitle}>Locked until</div>
//           <div className={styles.cryptoAmount}>{new Date(campaignPlanForStake.lockupDate).toLocaleString()}</div>
//           <div style={{ flexGrow: 1 }} />

//           <div className={styles.attentionText}>
//             <img style={{ height: 24, marginRight: 24 }} alt='' src={dangerOrange} />
//             <div>
//               By pressing Confirm & Lock you agree to the{' '}
//               <NavLink to={HELP_LINKS.TERMS} target='_blank' className={clsx(styles.descriptionLink)}>
//                 Terms and Conditions.
//               </NavLink>
//             </div>
//           </div>

//           {requestError ? <RequestError requestError={requestError} /> : null}

//           <button
//             // type='submit'
//             className='btn-new primary big'
//             // style={validateAmount() ? { backgroundColor: 'red' } : {}}
//             onClick={handleLock}
//           >
//             {isLoading ? <span className='spinner-border' /> : 'Confirm & Lock'}
//           </button>
//         </div>
//       </>
//     )
//   }

//   if (campaignPlanForStake) {
//     const asset = assets.find(token => token.assetId === campaignPlanForStake?.assetId)
//     const assetRate = ratesRaw?.find(
//       assetRateRaw => assetRateRaw.fromAssetId === asset?.assetId && assetRateRaw.toAssetId === currency.type
//     )

//     return (
//       <FormProvider {...methods}>
//         <form className={styles.mainForm} onSubmit={handleSubmit(handleConfirm)}>
//           <div className={styles.title}>Supercharge {campaignPlanForStake.assetId}</div>
//           <div style={{ flexGrow: 1 }} />
//           <InputAmount
//             errors={errors}
//             asset={asset}
//             register={register}
//             assetRate={assetRate}
//             setValue={setValue}
//             watchAmount={watchAmount}
//             isCurrency={isCurrency}
//             setIsCurrency={setIsCurrency}
//             clearErrors={clearErrors}
//           />
//           {errorAmountMsg ? (
//             <div style={{ height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//               <div className={styles.errorText}>{errorAmountMsg}</div>
//             </div>
//           ) : (
//             <div style={{ height: 60 }} />
//           )}

//           <button type='submit' className='btn-new primary big'>
//             {isLoading ? <span className='spinner-border' /> : 'Continue'}
//           </button>
//           <div style={{ flexGrow: 1 }} />
//         </form>
//       </FormProvider>
//     )
//   }

//   return (
//     <>
//       <div className={styles.title}>Choose an Event</div>
//       <div className={styles.containerModal}>
//         {campaignPlans.length
//           ? campaignPlans
//               .sort((a, b) => {
//                 const dateA = new Date(a.startDate).getTime()
//                 const dateB = new Date(b.startDate).getTime()

//                 return dateA - dateB
//               })
//               .map(plan => {
//                 return (
//                   <div style={{ width: '100%' }} key={plan.id}>
//                     <SuperchargeItem
//                       plan={plan}
//                       setCampaignPlanForStake={setCampaignPlanForStake}
//                       setIsSupercharge={setIsSupercharge}
//                     />
//                   </div>
//                 )
//               })
//           : null}
//       </div>
//     </>
//   )
// }
