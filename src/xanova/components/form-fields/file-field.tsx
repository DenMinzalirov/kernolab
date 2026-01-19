import { useState } from 'react'
import { Controller, FieldValues } from 'react-hook-form'
import { get } from 'lodash'
import clsx from 'clsx'

import styles from './styles.module.scss'
import { FormFieldComponentProps } from './types'
import { Uploader } from 'rsuite'
import { FileType } from 'rsuite/Uploader'

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface FileData {
  name: string
  base64: string
  type: string
  size: number
}

export function FileField<TFormData extends FieldValues = any>({ methods, field }: FormFieldComponentProps<TFormData>) {
  const {
    control,
    formState: { errors },
  } = methods

  const [fileList, setFileList] = useState<FileType[]>([])
  const fieldError = get(errors, field.fieldName)

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleUploadChange = async (filesChanged: FileType[], onChange: (value: any) => void) => {
    // Ограничиваем до 5 файлов
    const newFileList = filesChanged.slice(0, MAX_FILES)
    setFileList(newFileList)

    // Конвертируем все файлы в base64 с сохранением метаданных
    try {
      const fileDataPromises = newFileList.map(async fileItem => {
        if (fileItem.blobFile) {
          const file = fileItem.blobFile as File
          const base64 = await convertFileToBase64(file)

          return {
            name: file.name,
            base64: base64,
            type: file.type,
            size: file.size,
          } as FileData
        }
        return null
      })

      const fileDataArray = await Promise.all(fileDataPromises)
      // Возвращаем массив объектов с base64 и метаданными
      onChange(fileDataArray.filter(item => item !== null))
    } catch (error) {
      console.error('Error converting files to base64:', error)
      onChange([])
    }
  }

  const fieldName = String(field.fieldName)

  return (
    <div className='input-wrap-xanova'>
      <label htmlFor={fieldName} className={fieldError ? 'text-error' : ''}>
        {field.fieldLabel} {fieldError?.type === 'pattern' && 'Invalid'}
        {fieldError?.type === 'required' && 'Required'}
        {fieldError?.type === 'validate' && (String(fieldError.message) || 'Invalid')}
      </label>
      <p className={styles.fileHint}>
        Upload a copy of your government-issued ID and a recent proof of address (utility bill or bank statement, max 3
        months old). You may attach up to {MAX_FILES} files (max {MAX_FILE_SIZE / 1024 / 1024}MB each).
      </p>
      <div style={{ marginTop: '10px' }}>
        <Controller
          name={field.fieldName}
          control={control}
          rules={{
            required: field.isRequired,
            validate: value => {
              if (field.isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
                return 'At least one file is required.'
              }

              // Валидация для массива файлов
              if (fileList.length > 0) {
                // Проверка количества файлов
                if (fileList.length > MAX_FILES) {
                  return `Maximum ${MAX_FILES} files allowed.`
                }

                // Проверка каждого файла
                for (const fileItem of fileList) {
                  if (fileItem.blobFile) {
                    const file = fileItem.blobFile as File

                    // Проверка размера
                    if (file.size > MAX_FILE_SIZE) {
                      return `File "${file.name}" exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`
                    }

                    // Проверка типа
                    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
                    if (!allowedTypes.includes(file.type)) {
                      return `File "${file.name}" has invalid format. Only JPG, PNG, and PDF are allowed.`
                    }
                  }
                }
              }
            },
          }}
          render={({ field: controllerField }) => (
            <Uploader
              fileList={fileList}
              onChange={files => {
                handleUploadChange(files, controllerField.onChange)
              }}
              shouldUpload={() => false}
              autoUpload={false}
              action=''
              draggable
              accept='.jpg, .jpeg, .png, .pdf'
              multiple={true}
            >
              <div
                style={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  borderRadius: 10,
                  gap: 24,
                  cursor: 'pointer',
                  border: fieldError ? '1px solid red' : '1px dashed var(--Deep-Space)',
                  overflow: 'hidden',
                }}
              >
                {fileList.length ? (
                  <>
                    <div style={{ fontSize: 40 }}>📄</div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: 14, color: '#989898' }}>
                        {fileList.length} {fileList.length === 1 ? 'file' : 'files'} selected
                      </span>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        {fileList.slice(0, 3).map((file, idx) => (
                          <div key={file?.name}>{file?.name}</div>
                        ))}
                        {fileList.length > 3 && <div>...and {fileList.length - 3} more</div>}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: '#666' }}>
                      Drag and drop or Choose Files to add more (max {MAX_FILES})
                    </span>
                  </>
                ) : (
                  <>
                    <img alt={''} src={require('./cloud.png')} style={{ height: 38, width: 38 }} />
                    <span className={styles.fileTextMain}>Choose files or drag & drop them here.</span>
                    <span className={styles.fileTextDesc}>
                      JPEG, PNG and PDF formats, up to {MAX_FILES} files, {MAX_FILE_SIZE / 1024 / 1024}MB each
                    </span>
                    <button
                      onClick={e => e.preventDefault()}
                      style={{ width: 125 }}
                      className={clsx('btn-xanova gold small')}
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </Uploader>
          )}
        />
      </div>
    </div>
  )
}
