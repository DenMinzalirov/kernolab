import { createEvent } from 'effector'

import { $authToken } from './auth-token'
import { $cardHistoryByFilter } from './card-history'
import { $cardsBalance, $cardsData, $cardStatus } from './cefi-banking'
import { $allStakingContracts, $stakingPlans, $tierLevel } from './cefi-stacking'
import { $transactionsHistory } from './cefi-transactions-history'
import { $txnsHistoryCashback } from './cefi-transactions-history-cashback'
import { $transactionsHistoryFiat } from './cefi-transactions-history-fiat'
import { $favouriteAssets } from './favourite-assets'
import { $stepUpBlockExpiration } from './step-up-block-expiration'
import { $hasTravelRuleModalBeenShown, $travelRuleData } from './travel-rule-transactions'
import { $twoFaStatus } from './two-fa'
import { $userInfo } from './user-info'
import { $xanovaForms } from './xanova-forms'

export const resetStoresEv = createEvent()
$authToken.reset(resetStoresEv)
$cardStatus.reset(resetStoresEv)
$cardsData.reset(resetStoresEv)
$cardsBalance.reset(resetStoresEv)
$allStakingContracts.reset(resetStoresEv)
$tierLevel.reset(resetStoresEv)
$stakingPlans.reset(resetStoresEv)
$transactionsHistory.reset(resetStoresEv)
$txnsHistoryCashback.reset(resetStoresEv)
$cardHistoryByFilter.reset(resetStoresEv)
$transactionsHistoryFiat.reset(resetStoresEv)
$userInfo.reset(resetStoresEv)
$twoFaStatus.reset(resetStoresEv)
$stepUpBlockExpiration.reset(resetStoresEv)
$favouriteAssets.reset(resetStoresEv)
$stepUpBlockExpiration.reset(resetStoresEv)
$travelRuleData.reset(resetStoresEv)
$hasTravelRuleModalBeenShown.reset(resetStoresEv)
$xanovaForms.reset(resetStoresEv)
