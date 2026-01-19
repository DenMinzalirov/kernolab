import { OperationType, TransactionsNewServices } from 'wip/services/transactions-new'

export const fetchStakingTransactionHistory = async (groupedByOperationType: Record<string, number[]>) => {
  const operationMappings = [
    { type: OperationType.STAKING_CAMPAIGN_CLOSE, service: TransactionsNewServices.stakingCampaignCloseHistory },
    { type: OperationType.STAKING_CAMPAIGN_CREATE, service: TransactionsNewServices.stakingCampaignCreateHistory },
    { type: OperationType.STAKING_POS_CLOSE, service: TransactionsNewServices.stakingPosCloseHistory }, // old no use
    { type: OperationType.STAKING_POS_CREATE, service: TransactionsNewServices.stakingPosCreateHistory }, // old no use
    { type: OperationType.STAKING_REWARD, service: TransactionsNewServices.stakingRewardHistory },
    { type: OperationType.STAKING_ROLLING_CLOSE, service: TransactionsNewServices.stakingRollingCloseHistory }, // old
    { type: OperationType.STAKING_ROLLING_CREATE, service: TransactionsNewServices.stakingRollingCreateHistory }, // old
    {
      type: OperationType.STAKING_ROLLING_LEVELED_CLOSE,
      service: TransactionsNewServices.stakingRollingLeveledCloseHistory,
    },
    {
      type: OperationType.STAKING_ROLLING_LEVELED_CREATE,
      service: TransactionsNewServices.stakingRollingLeveledCreateHistory,
    },
    { type: OperationType.STAKING_SIMPLE_CLOSE, service: TransactionsNewServices.stakingSimpleCloseHistory },
    { type: OperationType.STAKING_SIMPLE_CREATE, service: TransactionsNewServices.stakingSimpleCreateHistory },
  ]

  const results = await Promise.all(
    operationMappings.map(({ type, service }) =>
      groupedByOperationType[type] ? service(groupedByOperationType[type]) : []
    )
  )

  return results
}
