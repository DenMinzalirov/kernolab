export type FromAndToAsset = {
  //TODO дубликат
  assetId: string
  icon: string
  minimalAmount: string
  availableBalance: string
}

export type StepType = {
  //TODO дубликат
  label: string
  id: string
  value: number
}

export type ConfigStepType = {
  //TODO дубликат
  [key: string]: StepType
}

export type OtcNewRequestForm = {
  //TODO дубликат
  amount: string
  fromAsset: FromAndToAsset | null
  toAsset: FromAndToAsset | null
  phone: string
  email: string
  name: string
}

export const STEPS_OTC = {
  //TODO дубликат
  TRADE_DETAILS: 'TRADE_DETAILS',
  CONSTANTS: 'CONSTANTS',
  SUMMARY: 'SUMMARY',
  SUCCESS: 'SUCCESS',
}

export const CONFIG_STEP = {
  //TODO дубликат
  TRADE_DETAILS: {
    label: 'Trade Details',
    id: STEPS_OTC.TRADE_DETAILS,
    value: 1,
  },
  CONSTANTS: {
    label: 'Contacts',
    id: STEPS_OTC.CONSTANTS,
    value: 2,
  },
  SUMMARY: {
    label: 'Summary',
    id: STEPS_OTC.SUMMARY,
    value: 3,
  },
  SUCCESS: {
    label: 'Success',
    id: STEPS_OTC.SUCCESS,
    value: 4,
  },
}
