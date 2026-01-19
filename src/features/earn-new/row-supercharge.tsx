// import { Dispatch, SetStateAction, useState } from 'react'
// import { useUnit } from 'effector-react'
// import moment from 'moment'
// import clsx from 'clsx'

// import { Modal, ProgressBar } from 'components'
// import { pages } from 'constant'
// import { convertTimestampToISO } from 'utils'
// import { handleError } from 'utils/error-handler'
// import { StakingCampaignContractResponse, StakingServices } from 'wip/services'
// import { updateEarning } from 'wip/stores/init'

// import { $assetsListData } from '../../model/cefi-combain-assets-data'
// import { $stakingPlans } from '../../model/cefi-stacking'
// import { addCommasToDisplayValue } from '../../utils/add-commas-to-display-value'
// import { NewSuperchargeEarningModal } from '../modals/new-supercharge-earning'
// import Hint from './hint-new'
// import styles from './styles.module.scss'
// import { calculateTimeLeft } from './timeLeftHelper'

// export interface EarnRow {
//   stake: StakingCampaignContractResponse
//   setIsSupercharge: Dispatch<SetStateAction<boolean>>
// }
// //TODO old DELETE
// function EarnSuperchargeRow({ stake, setIsSupercharge }: EarnRow) {
//   const assets = useUnit($assetsListData)
//   const asset = assets.find(assetItem => assetItem.assetId === stake.assetId)
//   const stakingPlans = useUnit($stakingPlans)
//   const campaignPlans = stakingPlans?.campaignPlans || []
//   const currentCampaignPlan = campaignPlans.find(campaignPlan => campaignPlan.id === stake.campaignId)
//   const [isLoading, setIsLoading] = useState(false)

//   const preparedExpectedCloseDate = convertTimestampToISO(stake.closeDate)
//   const preparedOpenDate = convertTimestampToISO(stake.openDate)

//   const stakeDays = moment(preparedExpectedCloseDate).diff(preparedOpenDate, 'days')
//   const daysDiffToday = moment(preparedExpectedCloseDate).diff(moment(), 'days')
//   const minutesDiffToday = moment(preparedExpectedCloseDate).diff(moment(), 'minutes')
//   console.log('minutesDiffToday', minutesDiffToday)
//   const daysLeftPercent = daysDiffToday >= 0 ? (daysDiffToday / stakeDays) * 100 : 0
//   const currentDate = new Date().toISOString()
//   const currentDateObj = new Date(currentDate)

//   const handleClaim = async (stakeItem: StakingCampaignContractResponse): Promise<void> => {
//     setIsLoading(true)
//     try {
//       await StakingServices.campaignClaim(stakeItem.id)
//       await updateEarning()
//     } catch (error) {
//       console.log('ERROR-handleClaim', error)
//       handleError(error)
//     }
//     setIsLoading(false)
//   }

//   const handleAddSupercharge = async (stakeItem: StakingCampaignContractResponse): Promise<void> => {
//     setIsLoading(true)
//     try {
//       Modal.open(<NewSuperchargeEarningModal setIsSupercharge={setIsSupercharge} stakeItem={stakeItem} />, {
//         title: pages.EARN.name,
//         isFullScreen: true,
//       })
//     } catch (error) {
//       console.log('ERROR-handleAddSupercharge', error)
//     }
//     setIsLoading(false)
//   }

//   const [isOpenHint, setIsOpenHint] = useState(false)

//   const handleOpenHint = (): void => {
//     setIsOpenHint(true)
//     setTimeout(() => {
//       setIsOpenHint(false)
//     }, 3000)
//   }

//   // const goToEarnPage = () => {
//   //   Modal.open(
//   //     <IndividualEarnModal
//   //       stake={stake}
//   //       daysLeftPercent={daysLeftPercent}
//   //       stakeDays={stakeDays}
//   //       daysLeft={daysLeft}
//   //       isLoading={isLoading}
//   //       handleClaim={handleClaim}
//   //     />,
//   //     { title: pages.EARN.name, isFullScreen: true }
//   //   )
//   // }

//   const estimatedReward = () => {
//     const value = stake.estimatedRewardAmount
//     if (!+value) {
//       return '>0.00001'
//     }
//     return addCommasToDisplayValue(value, 5)
//   }

//   // TODO: mobile screens not show
//   return (
//     <>
//       {/*<div onClick={goToEarnPage} className={styles.rowMobile}>*/}
//       {/*  <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>*/}
//       {/*    <img style={{ width: 48, height: 48, borderRadius: 5, marginRight: 11 }} src={asset?.icon} alt='' />*/}
//       {/*    <div*/}
//       {/*      style={{*/}
//       {/*        height: '100%',*/}
//       {/*        display: 'flex',*/}
//       {/*        flexDirection: 'column',*/}
//       {/*        justifyContent: 'space-around',*/}
//       {/*        flexGrow: 1,*/}
//       {/*      }}*/}
//       {/*    >*/}
//       {/*      <div className={styles.assetName}>{stake.assetId}</div>*/}
//       {/*      <ProgressBar value={daysLeftPercent} />*/}
//       {/*    </div>*/}
//       {/*  </div>*/}
//       {/*  <div*/}
//       {/*    style={{*/}
//       {/*      display: 'flex',*/}
//       {/*      flexDirection: 'column',*/}
//       {/*      justifyContent: 'space-around',*/}
//       {/*      alignItems: 'end',*/}
//       {/*      marginLeft: 10,*/}
//       {/*    }}*/}
//       {/*  >*/}
//       {/*    <div>{getBalanceString(+stake.userStakingAmount, 8)}</div>*/}
//       {/*    <div style={{ fontSize: 11, color: '#858EAA', fontWeight: 400 }}>*/}
//       {/*      Interest Paid {getBalanceString(+stake.payedRewardAmount, 2)}*/}
//       {/*    </div>*/}
//       {/*  </div>*/}
//       {/*</div>*/}
//       <div className={clsx(styles.row)}>
//         <div className={clsx(styles.cell, styles.cell3)}>
//           <img style={{ width: 46, height: 46, borderRadius: 5 }} src={asset?.icon} alt='' />
//           <div className={styles.assetName}>{stake.assetId}</div>
//         </div>

//         <div style={{ flexGrow: 1 }} />

//         <div className={clsx(styles.cell, styles.cell1)}>
//           {addCommasToDisplayValue(stake.userStakingAmount, 6)} {stake.assetId}
//         </div>

//         <div style={{ flexGrow: 1 }} />

//         <div className={clsx(styles.cell, styles.cell6)}>
//           {estimatedReward()} {stake.payedAssetId}
//         </div>

//         <div style={{ flexGrow: 1 }} />

//         <div className={clsx(styles.cell, styles.cell3)}>{new Date(stake.closeDate).toLocaleString()}</div>
//         <div style={{ flexGrow: 1 }} />
//         <div className={clsx(styles.cell, styles.cell1)}>
//           <div style={{ width: 110 }}>{calculateTimeLeft(stake.closeDate)}</div>
//           <ProgressBar value={daysLeftPercent} />
//         </div>
//         <div style={{ flexGrow: 1 }} />
//         <div className={clsx(styles.cell, styles.cell2)}>
//           {currentDateObj < new Date(currentCampaignPlan?.endDepositDate || stake.closeDate) ? (
//             <div
//               className={clsx(styles.actionBtn, styles.superchargeActionBtn)}
//               onClick={() => handleAddSupercharge(stake)}
//             >
//               {isLoading ? <span className='spinner-border' /> : 'Add more'}
//             </div>
//           ) : (
//             <div
//               onMouseEnter={() => {
//                 return minutesDiffToday >= 0 ? handleOpenHint() : null
//               }}
//               onMouseLeave={() => {
//                 return minutesDiffToday >= 0 ? setIsOpenHint(false) : null
//               }}
//               className={clsx(styles.actionBtn, styles.superchargeActionBtn)}
//               style={minutesDiffToday >= 0 ? { backgroundColor: '#ECECED', cursor: 'default' } : {}}
//               onClick={minutesDiffToday >= 0 ? () => handleOpenHint() : () => handleClaim(stake)}
//             >
//               {isLoading ? <span className='spinner-border' /> : 'Unlock & Claim'}
//               {isOpenHint ? <Hint /> : null}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }
