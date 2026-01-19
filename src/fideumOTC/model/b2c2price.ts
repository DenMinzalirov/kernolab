import { createEffect, createEvent, createStore, sample } from 'effector'

import { B2C2PriceRequest, B2C2PriceResponse, OTCTradeServices } from 'wip/services/fideumOTC-services/OTC-trade'

// Store для хранения текущего запроса
export const $priceRequest = createStore<B2C2PriceRequest | null>(null)

// Store для хранения текущей цены (rate)
export const $currentPrice = createStore<B2C2PriceResponse | null>(null)

// Store для хранения статуса загрузки
export const $isPriceFetching = createStore<boolean>(false)

// Store для хранения ошибки
export const $priceError = createStore<string | null>(null)

// Store для контроля интервала (активен или нет)
export const $isPriceIntervalActive = createStore<boolean>(false)

// Событие для установки параметров запроса
export const setPriceRequestEv = createEvent<B2C2PriceRequest | null>()

// Событие для запуска интервала обновления цены
export const startPriceIntervalEv = createEvent()

// Событие для остановки интервала
export const stopPriceIntervalEv = createEvent()

// Событие для ручного запроса цены
export const fetchPriceEv = createEvent()

// Effect для получения цены от B2C2
export const fetchB2C2PriceFx = createEffect(async (request: B2C2PriceRequest): Promise<B2C2PriceResponse> => {
  const response = await OTCTradeServices.getB2C2Price(request)
  return response
})

// Обновление store при установке нового запроса
$priceRequest.on(setPriceRequestEv, (_, request) => request)

// Обновление статуса загрузки
$isPriceFetching.on(fetchB2C2PriceFx.pending, (_, pending) => pending)

// Обновление текущей цены при успешном запросе
$currentPrice.on(fetchB2C2PriceFx.doneData, (_, price) => price)

// Обновление ошибки при неудачном запросе
$priceError
  .on(fetchB2C2PriceFx.failData, (_, error: any) => error?.data?.message || error?.message || 'Failed to get rate')
  .on(fetchB2C2PriceFx.doneData, () => null) // Сбрасываем ошибку при успешном запросе

// Управление статусом интервала
$isPriceIntervalActive.on(startPriceIntervalEv, () => true).on(stopPriceIntervalEv, () => false)

// Автоматический запрос цены при наличии параметров запроса
sample({
  clock: fetchPriceEv,
  source: { request: $priceRequest, isFetching: $isPriceFetching },
  filter: state => state.request !== null && !state.isFetching,
  fn: state => state.request!,
  target: fetchB2C2PriceFx,
})

// Удобные функции для использования в компонентах
export const setPriceRequest = (request: B2C2PriceRequest | null) => setPriceRequestEv(request)
export const startPriceInterval = () => startPriceIntervalEv()
export const stopPriceInterval = () => stopPriceIntervalEv()
export const fetchPrice = () => fetchPriceEv()

// Сброс всех данных (для очистки при закрытии модалки)
export const resetPriceStateEv = createEvent()
$priceRequest.reset(resetPriceStateEv)
$currentPrice.reset(resetPriceStateEv)
$priceError.reset(resetPriceStateEv)
$isPriceIntervalActive.reset(resetPriceStateEv)
export const resetPriceState = () => resetPriceStateEv()
