import { FieldValues, UseFormReturn } from 'react-hook-form'

import { CheckboxField } from './checkbox-field'
import { FileField } from './file-field'
import { PhoneField } from './phone-field'
import { RadioField } from './radio-field'
import { SelectField } from './select-field'
import { TextField } from './text-field'
import { FormField } from './types'

type RenderFieldProps<TFormData extends FieldValues = any> = {
  field: FormField<TFormData>
  methods: UseFormReturn<TFormData, any, TFormData>
}

export function renderField<TFormData extends FieldValues = any>({ field, methods }: RenderFieldProps<TFormData>) {
  const key = field.fieldName as string

  if (field.type === 'phone') {
    return <PhoneField key={key} methods={methods} field={field} />
  }
  if (field.type === 'file') {
    return <FileField key={key} methods={methods} field={field} />
  }
  if (field.type === 'select') {
    return <SelectField key={key} methods={methods} field={field} options={field.options || []} />
  }
  if (field.type === 'radio') {
    return <RadioField key={key} methods={methods} field={field} />
  }
  if (field.type === 'checkbox') {
    return <CheckboxField key={key} methods={methods} field={field} />
  }
  return <TextField key={key} methods={methods} field={field} />
}
