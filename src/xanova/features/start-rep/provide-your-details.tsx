import { UseFormReturn } from 'react-hook-form'
import clsx from 'clsx'

import { countryOptions } from '../../../features/modals/travel-rule-form/countries'
import { FormField, renderField } from '../../components/form-fields'
import { InputsRepForm } from './index'
import styles from './styles.module.scss'

export type InputsDetailFieldsT = FormField<InputsRepForm>

const detailFields: InputsDetailFieldsT[] = [
  {
    fieldName: 'businessType',
    type: 'radio',
    placeholder: 'Type here..',
    isRequired: true,
    fieldLabel: 'Business Type',
    options: [
      { value: 'individual', label: 'Individual' },
      { value: 'corporation', label: 'Corporation' },
    ],
  },
  {
    fieldName: 'country',
    type: 'select',
    placeholder: 'Please select',
    isRequired: true,
    fieldLabel: 'Country of Fiscal Residence',
    options: countryOptions,
  },
  {
    fieldName: 'revenueRange',
    type: 'select',
    placeholder: 'Please select',
    isRequired: true,
    fieldLabel: 'Monthly Revenue Range',
    options: [
      {
        value: '50,000-100,000USD per year',
        label: '50,000-100,000USD per year',
      },
      {
        value: '100,000-500,000USD per year',
        label: '100,000-500,000USD per year',
      },
      {
        value: '500,000-1,000,000USD per year',
        label: '500,000-1,000,000USD per year',
      },
    ],
  },
  {
    fieldName: 'contactMethod',
    type: 'checkbox',
    placeholder: '',
    isRequired: true,
    fieldLabel: 'Preferred Contact Method',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'videoCall', label: 'Video Call' },
    ],
  },
]

type Props = {
  methods: UseFormReturn<InputsRepForm, any, InputsRepForm>
}

export function ProvideYourDetails({ methods }: Props) {
  const renderFieldWrapper = (field: InputsDetailFieldsT) => renderField({ field, methods })

  return (
    <div>
      <div className={styles.title}>Provide Your Details</div>
      <div style={{ height: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{detailFields.map(renderFieldWrapper)}</div>
    </div>
  )
}
