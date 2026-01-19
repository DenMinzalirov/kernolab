import { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import clsx from 'clsx'

import { regex } from 'constant'

import plus from '../../../assets/icons/plus.svg'
import { FormField, renderField } from '../../components/form-fields'
import removeIcon from '../../icon-xanova/remove.svg'
import { InputsPersonalForm } from './index'
import styles from './styles.module.scss'

export type InputsPersonalFieldsT = FormField<InputsPersonalForm>

const inputsPersonalFields: InputsPersonalFieldsT[] = [
  {
    fieldName: 'fullName',
    type: 'text',
    placeholder: 'Type here..',
    isRequired: true,
    fieldLabel: 'Full Name',
  },
  {
    fieldName: 'birthDate',
    type: 'text',
    placeholder: 'DD/MM/YYYY',
    isRequired: true,
    fieldLabel: 'Date of Birth',
  },
  {
    fieldName: 'email',
    type: 'text',
    placeholder: 'Type here..',
    isRequired: true,
    fieldLabel: 'Email Address',
    pattern: regex.email,
  },
  {
    fieldName: 'phone',
    type: 'phone',
    placeholder: 'Type here..',
    isRequired: true,
    fieldLabel: 'Mobile phone',
  },
  {
    fieldName: 'file',
    type: 'file',
    placeholder: 'Type here..',
    isRequired: true,
    fieldLabel: 'Identity Documents',
  },
  {
    fieldName: 'profession',
    type: 'text',
    placeholder: 'Type here..',
    isRequired: true,
    fieldLabel: 'Current activity/profession',
  },
]

const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'partner', label: 'Partner' },
  { value: 'friend', label: 'Friend' },
  { value: 'business_partner', label: 'Business Partner' },
  { value: 'employer', label: 'Employer' },
  { value: 'employee', label: 'Employee' },
  { value: 'other_relative', label: 'Other Relative' },
  { value: 'legal_guardian', label: 'Legal Guardian' },
  { value: 'trustee', label: 'Trustee' },
]

const inputsBeneficiaryFields: InputsPersonalFieldsT[] = [
  {
    fieldName: 'fullNameBeneficiary',
    type: 'text',
    placeholder: 'Type here..',
    isRequired: true,
    fieldLabel: 'Full Name',
  },
  {
    fieldName: 'relationshipBeneficiary',
    type: 'select',
    placeholder: 'Select relationship..',
    isRequired: true,
    fieldLabel: 'Relationship to the insured person',
    options: relationshipOptions,
  },
  {
    fieldName: 'percentageBeneficiary',
    type: 'text',
    placeholder: 'Type here..',
    isRequired: true,
    fieldLabel: 'Percentage Share',
  },
  {
    fieldName: 'birthDateBeneficiary',
    type: 'text',
    placeholder: 'DD/MM/YYYY',
    isRequired: true,
    fieldLabel: 'Date of Birth',
  },
]

type PersonalInformationFormProps = {
  methods: UseFormReturn<InputsPersonalForm, any, InputsPersonalForm>
}

export function PersonalInformationForm({ methods }: PersonalInformationFormProps) {
  const [showBeneficiaryFields, setShowBeneficiaryFields] = useState(false)

  const handleRemoveBeneficiary = () => {
    setShowBeneficiaryFields(false)
  }

  const renderFieldWrapper = (field: InputsPersonalFieldsT) => renderField({ field, methods })

  return (
    <div>
      <div className={styles.title}>Personal Information Form</div>
      <div style={{ height: 24 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {inputsPersonalFields.map(renderFieldWrapper)}
      </div>
      <div style={{ height: 50 }} />
      <div style={{ borderBottom: '1px dashed var(--Deep-Space)', opacity: 0.2 }} />
      <div style={{ height: 50 }} />
      <div className={styles.title2}>Beneficiary Information</div>
      <div style={{ height: 12 }} />
      <div className={styles.subTitle}>
        Specify who should receive your insurance benefits if&nbsp;something happens to you.
      </div>

      {!showBeneficiaryFields && (
        <>
          <div style={{ height: 12 }} />
          <button
            className={clsx('btn-with-icon-xanova grey-small')}
            type='button'
            onClick={() => setShowBeneficiaryFields(true)}
          >
            <img alt='Add Beneficiary' src={plus} />
            Add Beneficiary
          </button>
        </>
      )}

      {showBeneficiaryFields && (
        <>
          <div style={{ height: 36 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {inputsBeneficiaryFields.map(renderFieldWrapper)}
          </div>
          <div style={{ height: 36 }} />
          <div onClick={handleRemoveBeneficiary} className={styles.removeString}>
            <img alt={'Remove'} src={removeIcon} />
            Remove beneficiary
          </div>
        </>
      )}

      <div style={{ height: 50 }} />
      <div style={{ borderBottom: '1px dashed var(--Deep-Space)', opacity: 0.2 }} />
      <div style={{ height: 50 }} />
    </div>
  )
}
