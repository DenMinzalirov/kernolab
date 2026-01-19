import { createEffect, createEvent, createStore } from 'effector'

import { XanovaServices } from '../wip/services'

export enum XanovaFormName {
  ACCOUNTING_SUPPORT = 'ACCOUNTING_SUPPORT',
  FISCAL_STRATEGY = 'FISCAL_STRATEGY',
  INSURANCE = 'INSURANCE',
  TRADING_INVESTMENTS = 'TRADING_INVESTMENTS',
  AI_TOOL = 'AI_TOOL',
}

export enum XanovaFormStatus {
  IDLE = 'IDLE', // Форма загружена, но данных нет (пустой ответ)
  LOADING = 'LOADING', // Форма в процессе загрузки
  LOADED = 'LOADED', // Форма успешно загружена с данными
  ERROR = 'ERROR', // Ошибка при загрузке формы
}

export type XanovaFormData = Record<string, any>

export interface XanovaFormState {
  status: XanovaFormStatus
  data: XanovaFormData | null
  error: string | null
}

export interface XanovaFormsState {
  [XanovaFormName.ACCOUNTING_SUPPORT]: XanovaFormState
  [XanovaFormName.FISCAL_STRATEGY]: XanovaFormState
  [XanovaFormName.INSURANCE]: XanovaFormState
  [XanovaFormName.TRADING_INVESTMENTS]: XanovaFormState
  [XanovaFormName.AI_TOOL]: XanovaFormState
}

// Стартовое состояние форм - LOADING, так как загрузка должна происходить при старте приложения
const createInitialFormState = (): XanovaFormState => ({
  status: XanovaFormStatus.LOADING,
  data: null,
  error: null,
})

const initialState: XanovaFormsState = {
  [XanovaFormName.ACCOUNTING_SUPPORT]: createInitialFormState(),
  [XanovaFormName.FISCAL_STRATEGY]: createInitialFormState(),
  [XanovaFormName.INSURANCE]: createInitialFormState(),
  [XanovaFormName.TRADING_INVESTMENTS]: createInitialFormState(),
  [XanovaFormName.AI_TOOL]: createInitialFormState(),
}

// Store для хранения форм
export const $xanovaForms = createStore<XanovaFormsState>(initialState)

// Функция проверки, есть ли данные в форме
const hasFormData = (data: any): boolean => {
  if (data === null || data === undefined) return false
  if (typeof data === 'object' && Object.keys(data).length === 0) return false
  return true
}

// Effect для загрузки всех форм
export const fetchXanovaFormsFx = createEffect(async () => {
  const formNames = Object.values(XanovaFormName)

  const formsPromises = formNames.map(async formName => {
    try {
      const formData = await XanovaServices.getSubmittedForm(formName)
      const hasData = hasFormData(formData)

      return {
        formName,
        success: true,
        hasData,
        data: hasData ? formData : null,
        error: null,
      }
    } catch (error) {
      console.error(`Error fetching form ${formName}:`, error)
      return {
        formName,
        success: false,
        hasData: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  const results = await Promise.all(formsPromises)

  return results
})

// Event для очистки форм
export const clearXanovaFormsEv = createEvent()

// Обработчики состояний
// После загрузки форм устанавливаем статус в зависимости от результата:
// - ERROR: если произошла ошибка при загрузке
// - LOADED: если запрос успешен и данные есть
// - IDLE: если запрос успешен (200), но данных нет (пустой ответ)
$xanovaForms
  .on(fetchXanovaFormsFx.doneData, (state, results) => {
    const newState = { ...state }
    results.forEach(({ formName, success, hasData, data, error }) => {
      if (!success) {
        // Ошибка при загрузке
        newState[formName as XanovaFormName] = {
          status: XanovaFormStatus.ERROR,
          data: null,
          error,
        }
      } else if (hasData) {
        // Данные есть
        newState[formName as XanovaFormName] = {
          status: XanovaFormStatus.LOADED,
          data,
          error: null,
        }
      } else {
        // Данных нет (пустой ответ, но статус 200)
        newState[formName as XanovaFormName] = {
          status: XanovaFormStatus.IDLE,
          data: null,
          error: null,
        }
      }
    })
    return newState
  })
  .reset(clearXanovaFormsEv)

// Вспомогательные селекторы для получения конкретной формы
export const $accountingSupportForm = $xanovaForms.map(state => state[XanovaFormName.ACCOUNTING_SUPPORT])
export const $fiscalStrategyForm = $xanovaForms.map(state => state[XanovaFormName.FISCAL_STRATEGY])
export const $insuranceForm = $xanovaForms.map(state => state[XanovaFormName.INSURANCE])
export const $tradingInvestmentsForm = $xanovaForms.map(state => state[XanovaFormName.TRADING_INVESTMENTS])
export const $aiToolForm = $xanovaForms.map(state => state[XanovaFormName.AI_TOOL])

// Селектор для проверки, все ли формы загружены
export const $allFormsLoaded = $xanovaForms.map(state => {
  return Object.values(state).every(form => form.status === XanovaFormStatus.LOADED)
})

// Селектор для проверки, идет ли загрузка хотя бы одной формы
export const $isAnyFormLoading = $xanovaForms.map(state => {
  return Object.values(state).some(form => form.status === XanovaFormStatus.LOADING)
})

// Селектор для проверки, есть ли ошибки в формах
export const $hasFormErrors = $xanovaForms.map(state => {
  return Object.values(state).some(form => form.status === XanovaFormStatus.ERROR)
})
