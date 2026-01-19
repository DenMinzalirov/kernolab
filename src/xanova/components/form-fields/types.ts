import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'

export type FormFieldType = 'text' | 'date' | 'phone' | 'file' | 'select' | 'radio' | 'checkbox'

export type FormFieldOption = {
  value: string
  label: string
}

export type FormField<TFormData extends FieldValues = any> = {
  fieldName: FieldPath<TFormData>
  type: FormFieldType
  placeholder: string
  isRequired: boolean
  pattern?: RegExp
  fieldLabel: string
  options?: Array<FormFieldOption>
}

export type FormFieldComponentProps<TFormData extends FieldValues = any> = {
  methods: UseFormReturn<TFormData, any, TFormData>
  field: FormField<TFormData>
  options?: Array<FormFieldOption>
}
