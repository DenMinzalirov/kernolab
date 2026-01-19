import { createEffect, createEvent, createStore, sample } from 'effector'

import {
  AccountLimitsResponse,
  BasicCardInfo,
  CardService,
  ECardStatus,
  ECardType,
  EDispatchMethod,
  OrderStatus,
} from 'wip/services'

const cardInfoMockPhysical: BasicCardInfo = {
  cardUuid: '123e4567-e89b-12d3-a456-426614174000',
  predecessorCardUuid: null,
  type: ECardType.CHIP_AND_PIN,
  maskedCardNumber: '**** **** **** 1234',
  expiryDate: '12/26',
  blockType: null,
  blockedAt: null,
  blockedBy: null,
  status: ECardStatus.ACTIVE,
  limits: {
    dailyContactlessPurchaseAvailable: '1000',
    dailyContactlessPurchaseUsed: '200',
    dailyInternetPurchaseAvailable: '5000',
    dailyInternetPurchaseUsed: '1000',
    dailyOverallPurchaseAvailable: '7000',
    dailyOverallPurchaseUsed: '1200',
    dailyPurchaseAvailable: '8000',
    dailyPurchaseUsed: '1700',
    dailyWithdrawalAvailable: '2000',
    dailyWithdrawalUsed: '500',
    monthlyContactlessPurchaseAvailable: '30000',
    monthlyContactlessPurchaseUsed: '5000',
    monthlyInternetPurchaseAvailable: '60000',
    monthlyInternetPurchaseUsed: '15000',
    monthlyOverallPurchaseAvailable: '100000',
    monthlyOverallPurchaseUsed: '25000',
    monthlyPurchaseAvailable: '120000',
    monthlyPurchaseUsed: '30000',
    monthlyWithdrawalAvailable: '10000',
    monthlyWithdrawalUsed: '2000',
    weeklyContactlessPurchaseAvailable: '7000',
    weeklyContactlessPurchaseUsed: '1700',
    weeklyInternetPurchaseAvailable: '15000',
    weeklyInternetPurchaseUsed: '5000',
    weeklyOverallPurchaseAvailable: '25000',
    weeklyOverallPurchaseUsed: '7000',
    weeklyPurchaseAvailable: '30000',
    weeklyPurchaseUsed: '10000',
    weeklyWithdrawalAvailable: '5000',
    weeklyWithdrawalUsed: '1000',
  },
  security: {
    contactlessEnabled: true,
    withdrawalEnabled: true,
    internetPurchaseEnabled: true,
    overallLimitsEnabled: true,
  },
  deliveryAddress: {
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Tech Corp',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    postalCode: '10001',
    city: 'New York',
    countryCode: 'US',
    dispatchMethod: EDispatchMethod.DHL_EXPRESS,
    phone: '+1234567890',
    trackingNumber: 'DHL123456789',
  },
  embossingName: 'JOHN DOE',
}

const cardInfoMockVirtual: BasicCardInfo = {
  cardUuid: '456e7890-e12b-34c5-d678-901234567890',
  predecessorCardUuid: null,
  type: ECardType.VIRTUAL,
  maskedCardNumber: '**** **** **** 5678',
  expiryDate: '12/27',
  blockType: null,
  blockedAt: null,
  blockedBy: null,
  status: ECardStatus.ACTIVE,
  limits: {
    dailyContactlessPurchaseAvailable: '2000',
    dailyContactlessPurchaseUsed: '300',
    dailyInternetPurchaseAvailable: '10000',
    dailyInternetPurchaseUsed: '2000',
    dailyOverallPurchaseAvailable: '15000',
    dailyOverallPurchaseUsed: '2400',
    dailyPurchaseAvailable: '16000',
    dailyPurchaseUsed: '3400',
    dailyWithdrawalAvailable: '3000',
    dailyWithdrawalUsed: '800',
    monthlyContactlessPurchaseAvailable: '60000',
    monthlyContactlessPurchaseUsed: '10000',
    monthlyInternetPurchaseAvailable: '120000',
    monthlyInternetPurchaseUsed: '30000',
    monthlyOverallPurchaseAvailable: '200000',
    monthlyOverallPurchaseUsed: '50000',
    monthlyPurchaseAvailable: '240000',
    monthlyPurchaseUsed: '60000',
    monthlyWithdrawalAvailable: '20000',
    monthlyWithdrawalUsed: '4000',
    weeklyContactlessPurchaseAvailable: '14000',
    weeklyContactlessPurchaseUsed: '3400',
    weeklyInternetPurchaseAvailable: '30000',
    weeklyInternetPurchaseUsed: '10000',
    weeklyOverallPurchaseAvailable: '50000',
    weeklyOverallPurchaseUsed: '14000',
    weeklyPurchaseAvailable: '60000',
    weeklyPurchaseUsed: '20000',
    weeklyWithdrawalAvailable: '10000',
    weeklyWithdrawalUsed: '2000',
  },
  security: {
    contactlessEnabled: true,
    withdrawalEnabled: true,
    internetPurchaseEnabled: true,
    overallLimitsEnabled: true,
  },
  deliveryAddress: null,
  embossingName: null,
}

export const $cardStatus = createStore<OrderStatus>({
  currentStep: 'NONE',
  nextStep: '',
  additionalInfo: {
    kyc: 'FAILED',
  },
})
export const getCardStatusFx = createEffect(async () => {
  return await CardService.getOrderStatus()
})
$cardStatus.on(getCardStatusFx.doneData, (_, repos) => repos)

//
export const $selectedCardUuid = createStore<string | null>(null)
export const selectedCardUuidEv = createEvent<string | null>()
$selectedCardUuid.on(selectedCardUuidEv, (s, p) => p)

//
// MOCK: Мок-данные для демо при ошибке сервера
const mockAccountLimits: AccountLimitsResponse = {
  dailyInternetPurchase: 5000,
  dailyContactlessPurchase: 1000,
  monthlyInternetPurchase: 60000,
  monthlyContactlessPurchase: 30000,
}

// MOCK: Начальное значение мок-баланса
const initialMockCardsBalance = '434.16'

//
export const $cardsData = createStore<BasicCardInfo[]>([])
export const getCardsDataFx = createEffect(async () => {
  const allActiveCards = await CardService.getAllActiveCards()
  // MOCK TEST
  // if (allActiveCards.length === 1) {
  //   allActiveCards.push(cardInfoMock)
  // }

  if (!$selectedCardUuid.getState() && allActiveCards.length) {
    const selectedCard = allActiveCards.find(card => card.type === 'VIRTUAL')?.cardUuid
    //TODO добавить проверку что карта активна
    selectedCard && selectedCardUuidEv(selectedCard)
  }

  return allActiveCards
})
$cardsData.on(getCardsDataFx.doneData, (_, repos) => repos)

// MOCK: Установка мок-данных при ошибке для getCardsDataFx (обе карты: виртуальная и физическая)
sample({
  clock: getCardsDataFx.failData,
  fn: () => {
    console.error('Error fetching cards data, using mock data')
    return [cardInfoMockVirtual, cardInfoMockPhysical]
  },
  target: $cardsData,
})

// MOCK: Установка выбранной карты (виртуальной) при использовании мок-данных
sample({
  clock: getCardsDataFx.failData,
  source: $selectedCardUuid,
  filter: uuid => !uuid,
  fn: () => cardInfoMockVirtual.cardUuid,
  target: selectedCardUuidEv,
})

//
// MOCK: Инициализация store с начальным мок-балансом
export const $cardsBalance = createStore<string>(initialMockCardsBalance)
export const getCardsBalanceFx = createEffect(async () => {
  const cardsBalance = await CardService.getCardBalance()
  return cardsBalance.amount
})
// MOCK: Обновляем баланс только если пришли данные, иначе оставляем мок-баланс
$cardsBalance.on(getCardsBalanceFx.doneData, (currentBalance, newBalance) => {
  return newBalance && newBalance.trim() !== '' ? newBalance : currentBalance
})

// MOCK: Установка мок-баланса при ошибке для getCardsBalanceFx (если запрос не удался)
sample({
  clock: getCardsBalanceFx.failData,
  fn: () => {
    console.error('Error fetching cards balance, using mock data')
    return $cardsBalance.getState() || initialMockCardsBalance
  },
  target: $cardsBalance,
})

// MOCK: Эффект для пополнения карты с обновлением баланса
export interface TopUpCardRequest {
  assetId: string
  amount: string
}

export const topUpCardFx = createEffect(async (data: TopUpCardRequest) => {
  try {
    await CardService.topUpCard(data)
    return data.amount
  } catch (error) {
    // Если запрос не удался, все равно обновляем баланс для мок-данных
    console.error('Error top up card, but updating mock balance', error)
    return data.amount
  }
})

// MOCK: Обновление баланса при успешном пополнении
sample({
  clock: topUpCardFx.doneData,
  source: $cardsBalance,
  fn: (currentBalance, amount) => {
    const current = parseFloat(currentBalance || '0') || 0
    const topUpAmount = parseFloat(amount || '0') || 0
    const newBalance = (current + topUpAmount).toFixed(2)
    console.log(`Updating card balance: ${currentBalance} + ${amount} = ${newBalance}`)
    return newBalance
  },
  target: $cardsBalance,
})

export const $cardAccountLimits = createStore<AccountLimitsResponse>({
  dailyInternetPurchase: 0,
  dailyContactlessPurchase: 0,
  monthlyInternetPurchase: 0,
  monthlyContactlessPurchase: 0,
})
export const getCardAccountLimitsFx = createEffect(async () => {
  const cardsBalance = await CardService.getCardAccountLimits()
  return cardsBalance
})
$cardAccountLimits.on(getCardAccountLimitsFx.doneData, (_, repos) => repos)

// MOCK: Установка мок-лимитов при ошибке для getCardAccountLimitsFx
sample({
  clock: getCardAccountLimitsFx.failData,
  fn: () => {
    console.error('Error fetching card account limits, using mock data')
    return mockAccountLimits
  },
  target: $cardAccountLimits,
})
