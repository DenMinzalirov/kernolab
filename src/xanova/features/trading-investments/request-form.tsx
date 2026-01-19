import { useState } from 'react'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'

import { XanovaServices } from 'wip/services'
import { fetchXanovaFormsFx, XanovaFormName } from 'model'

import styles from './styles.module.scss'
import { FormField, renderField } from 'xanova/components/form-fields'

const defaultValues = {
  investmentAmountRange: '',
  riskTolerance: '',
  timeHorizon: '',
}

export type InputsRequestForm = {
  investmentAmountRange: string
  riskTolerance: string
  timeHorizon: string
}

export type InputsRequestFieldsT = FormField<InputsRequestForm>

const investmentAmountOptions = [
  { value: '5000-15000', label: '$5,000 - $15,000' },
  { value: '15000-30000', label: '$15,000 - $30,000' },
  { value: '30000+', label: '$30,000 - $50,000+' },
]

const riskToleranceOptions = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'moderate-high', label: 'Moderate-High' },
]

const timeHorizonOptions = [
  { value: '1-5-years', label: '1-5 years' },
  { value: '1-3-years', label: '1-3 years' },
]

const requestFormFields: InputsRequestFieldsT[] = [
  {
    fieldName: 'investmentAmountRange',
    type: 'select',
    placeholder: 'Please select',
    isRequired: true,
    fieldLabel: 'Investment Amount Range',
    options: investmentAmountOptions,
  },
  {
    fieldName: 'riskTolerance',
    type: 'select',
    placeholder: 'Please select',
    isRequired: true,
    fieldLabel: 'Risk Tolerance',
    options: riskToleranceOptions,
  },
  {
    fieldName: 'timeHorizon',
    type: 'select',
    placeholder: 'Please select',
    isRequired: true,
    fieldLabel: 'Time Horizon',
    options: timeHorizonOptions,
  },
]

export function RequestForm({ onClose }: { onClose: () => void }) {
  const methods = useForm<InputsRequestForm>({ defaultValues })

  const [isLoading, setIsLoading] = useState(false)

  const renderFieldWrapper = (field: InputsRequestFieldsT) => renderField({ field, methods })

  const handleSubmit = methods.handleSubmit(async data => {
    console.log('Form data:', data)

    const formData = {
      ...data,
      createdAt: new Date().toISOString(),
    }

    try {
      setIsLoading(true)

      await XanovaServices.submitForm(XanovaFormName.TRADING_INVESTMENTS, formData)

      await fetchXanovaFormsFx()
    } catch (error) {
      console.log('ERROR-insurance', error)
    }
    setIsLoading(false)

    onClose()
  })

  return (
    <div className={styles.contentWrap}>
      <div className={styles.formWrap}>
        <div className={styles.title}>Request Form</div>
        <div style={{ height: 24 }} />
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {requestFormFields.map(renderFieldWrapper)}
          </div>

          <div style={{ height: 36 }} />

          <button type={'submit'} className={clsx('btn-xanova gold')}>
            {isLoading ? <span className='spinner-border' /> : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}
