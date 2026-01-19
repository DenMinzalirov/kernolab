import { FieldValues } from 'react-hook-form'
import { get } from 'lodash'
import clsx from 'clsx'

import styles from '../../features/start-rep/styles.module.scss'
import { FormFieldComponentProps } from './types'

export function CheckboxField<TFormData extends FieldValues = any>({
  methods,
  field,
}: FormFieldComponentProps<TFormData>) {
  const {
    register,
    formState: { errors },
  } = methods

  const fieldError = get(errors, field.fieldName)

  if (!field.options || field.options.length === 0) {
    return null
  }

  return (
    <div>
      <label className={fieldError ? 'text-error' : ''}>
        {field.fieldLabel} {fieldError?.type === 'required' && 'Required'}
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {field.options.map(option => (
          <label key={option.value} className={clsx('checkbox-wrap-xanova')}>
            <input
              type='checkbox'
              value={option.value}
              {...register(field.fieldName, { required: field.isRequired })}
            />
            <span className='checkbox-xanova-box' />
            <span className={clsx('checkbox-xanova-text')}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
