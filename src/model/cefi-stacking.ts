import { createEffect, createEvent, createStore } from 'effector'

import { StakingCampaignContractResponse, StakingContract, StakingPlansResponse, StakingServices } from 'wip/services'

export const $allStakingContracts = createStore<StakingContract[]>([])
export const allStakingContractsChangedEv = createEvent<[]>()
export const $campaignStakingContracts = createStore<StakingCampaignContractResponse[]>([])

export const allStakingContractsDataFx = createEffect(async () => {
  const allStakingContracts = await StakingServices.contracts()

  if (allStakingContracts) {
    const simpleContracts =
      allStakingContracts.simpleContracts?.map(contract => ({ ...contract, isSimple: true })) || []

    const rollingLeveledContracts =
      allStakingContracts.rollingLeveledContracts?.map(contract => ({
        ...contract,
        isRollingLeveled: true,
      })) || []

    const rollingResponses =
      allStakingContracts.rollingResponses?.map(contract => ({
        ...contract,
        isRollingResponses: true,
      })) || []

    const contractsList = [...simpleContracts, ...rollingLeveledContracts, ...rollingResponses]

    const campaignResponses =
      allStakingContracts.campaignContracts?.map(contract => ({
        ...contract,
        isCampaign: true,
      })) || []

    return {
      allContracts: contractsList.filter(contract => !!Number(contract.amount)),
      campaignContracts: campaignResponses,
    }
  }
})

$allStakingContracts
  .on(allStakingContractsDataFx.doneData, (_, data) => data!.allContracts)
  .on(allStakingContractsChangedEv, (s, p) => p)

$campaignStakingContracts.on(allStakingContractsDataFx.doneData, (_, data) => data!.campaignContracts)

//
export const $tierLevel = createStore<number>(0)
export const tierLevelFx = createEffect(async () => {
  const tierLevel = await StakingServices.tierLevel()
  return tierLevel
})
$tierLevel.on(tierLevelFx.doneData, (_, repos) => repos)

//
export const $stakingPlans = createStore<StakingPlansResponse>({
  simplePlans: [],
  rollingPlans: [],
  rollingLeveledPlans: [],
  campaignPlans: [],
})
export const stakingPlansFx = createEffect(async () => {
  const stakingPlans = await StakingServices.stakingPlans()
  return stakingPlans
})
$stakingPlans.on(stakingPlansFx.doneData, (_, repos) => repos)
