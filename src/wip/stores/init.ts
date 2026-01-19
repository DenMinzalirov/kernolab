import { getToken, parseJwt } from 'utils'
import { theme, themeValue } from 'config'
import { assetsRatesFx } from 'model/cef-rates-coingecko'
import { assetsCefiExchangeRatesFx } from 'model/cef-rates-exchange'
import { assetsDataFx } from 'model/cefi-assets-list'
import {
  $cardStatus,
  getCardAccountLimitsFx,
  getCardsBalanceFx,
  getCardsDataFx,
  getCardStatusFx,
} from 'model/cefi-banking'
import { cefiCryptoDepositWithdrawAssetsFx } from 'model/cefi-crypto-deposit-withdraw-assets'
import { myAssetsFx } from 'model/cefi-my-assets-list'
import { allStakingContractsDataFx, stakingPlansFx, tierLevelFx } from 'model/cefi-stacking'
import { getFavouriteAssetsFx } from 'model/favourite-assets'
import { getAllocationsLaunchpadsFx, getLaunchpadsFx } from 'model/launchpads'
import { mainLoaderChangedEv } from 'model/mainLoader'
import { getMembershipStatusFx } from 'model/membership-status'
import {
  $stepUpBlockExpiration,
  stepUpBlockExpirationChangedEv,
  stepUpBlockExpirationFx,
} from 'model/step-up-block-expiration'
import { getTierXanovaFx } from 'model/tier-xanova'
import { getTiersXanovaFx } from 'model/tiers-xanova'
import { getTravelRuleDataFx } from 'model/travel-rule-transactions'
import { setTwoFaStatusEv } from 'model/two-fa'

import { clientsOTCDataFx, refreshClients } from 'fideumOTC/model/clients-fideumOTC'
import { instrumentsOTCDataFx } from 'fideumOTC/model/insruments-B2C2-fideumOTC'
import { lpOTCDataFx } from 'fideumOTC/model/lp-fideumOTC'
import { refreshTrades } from 'fideumOTC/model/trades-fideumOTC'

export const updateEarning = async () => {
  const token = getToken()

  await allStakingContractsDataFx()
  await stakingPlansFx()
  await tierLevelFx()
}

// Without token
const updateAvailableAssets = async () => {
  await assetsDataFx()
  await assetsRatesFx() // coingecko rates
  // TODO: off launchpad
  if (theme === themeValue.pairs) {
    await getLaunchpadsFx({ page: '0', size: '2000' })
  }
}

export async function initApp() {
  const token = getToken()
  const stepUpBlockExpiration = $stepUpBlockExpiration.getState()

  if (token) {
    const parsedToken = parseJwt(token || '')
    const scope = parsedToken?.scope || []

    if (theme === themeValue.fideumOTC) {
      refreshTrades()
      refreshClients()
      await lpOTCDataFx()
      await instrumentsOTCDataFx()

      mainLoaderChangedEv(false)
      return
    }

    if (theme === themeValue.xanova) {
      if (scope.includes('MEMBER')) {
        try {
          // check 2fa
          setTwoFaStatusEv(scope.includes('MFA'))

          // check block withdrawal
          if (scope.includes('STEP_UP_BLOCKED')) {
            !stepUpBlockExpiration && (await stepUpBlockExpirationFx())
          } else {
            stepUpBlockExpirationChangedEv(null)
          }

          // check membership
          getMembershipStatusFx().then(r => null)
          getTierXanovaFx().then(r => null)
          getTiersXanovaFx().then(r => null)

          await updateAvailableAssets() // assets list
          await cefiCryptoDepositWithdrawAssetsFx()
        } catch (error) {
          console.log('ERROR-stepUpBlockExpirationFx', error)
        }
      }
      mainLoaderChangedEv(false)
      return
    }

    await updateAvailableAssets() // assets list

    // new state
    await myAssetsFx()
    await cefiCryptoDepositWithdrawAssetsFx()
    await assetsCefiExchangeRatesFx()
    await getFavouriteAssetsFx()

    try {
      if (scope.includes('KYC')) {
        await getTravelRuleDataFx()

        await getAllocationsLaunchpadsFx({ page: '0', size: '2000' })

        // often 500 error
        updateEarning().catch(e => console.log('ERROR-updateEarning', e))
      }
    } catch (e) {
      console.log('ERROR-get-stakingContracts', e)
    }

    try {
      // get card data only pairs
      // @ts-ignore
      if (theme === themeValue.pairs && scope.includes('KYC')) {
        await getCardStatusFx()

        const status = $cardStatus.getState()
        if (status.currentStep === 'PROCESSED') {
          await getCardsDataFx()
          await getCardAccountLimitsFx()
          await getCardsBalanceFx()
        }
      }
    } catch (e) {
      console.log('ERROR-getCardStatusFx', e)
    }

    try {
      // check 2fa
      setTwoFaStatusEv(scope.includes('MFA'))

      // check block withdrawal
      if (scope.includes('STEP_UP_BLOCKED')) {
        !stepUpBlockExpiration && (await stepUpBlockExpirationFx())
      } else {
        stepUpBlockExpirationChangedEv(null)
      }
    } catch (error) {
      console.log('ERROR-stepUpBlockExpirationFx', error)
    }
  }
  mainLoaderChangedEv(false)
}
