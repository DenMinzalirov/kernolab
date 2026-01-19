import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { goSupportXanova } from '../../../config'
import { fetchXanovaFormsFx, XanovaFormName, XanovaFormStatus } from '../../../model'
import {
  $stepControllerNextStep,
  resetStepControllerNextStepEV,
  setStepControllerNextStepEV,
} from '../../../model/step-controller'
import { $insuranceForm } from '../../../model/xanova-forms'
import { XanovaServices } from '../../../wip/services'
import { InitialFormComponent } from '../../components/initialFormComponent'
import { StepsLayoutXanova } from '../../components/steps-layout'
import { SuccessContentXanova } from '../../components/success-content/success-content'
import { DigitalSignatures } from './digital-signatures'
import { PersonalInformationForm } from './personal-information-form'
import styles from './styles.module.scss'
import { FileType } from 'rsuite/Uploader'

interface SignatureData {
  name: string
  base64: string
  type: string
  size: number
}

const defaultValues = {
  fullName: '',
  birthDate: '',
  email: '',
  phone: '',
  file: null,
  profession: '',
  fullNameBeneficiary: '',
  percentageBeneficiary: '',
  birthDateBeneficiary: '',
  relationshipBeneficiary: '',
  healthDeclaration: 'no',
  healthDeclaration2: 'no',
  insuranceOption: 'INSURANCE_OPTION_1_GNP_SEGUROS',
}

export type InputsPersonalForm = {
  fullName: string
  birthDate: string
  email: string
  phone: string
  file: FileType | null
  profession: string
  fullNameBeneficiary: string
  percentageBeneficiary: string
  birthDateBeneficiary: string
  relationshipBeneficiary: string
  healthDeclaration: string
  healthDeclaration2: string
  insuranceOption: string
}

export function InsuranceXanova() {
  const activeStep = useUnit($stepControllerNextStep)
  const insuranceForm = useUnit($insuranceForm)

  const methods = useForm<InputsPersonalForm>({ defaultValues })

  const { handleSubmit, register, getValues } = methods

  const [isLoading, setIsLoading] = useState(false)

  const stepsLayoutConfig = [
    { label: 'Choose a Service', value: 'CHOOSE' },
    { label: 'Health Declaration', value: 'HEALTH_DECLARATION' },
    { label: 'Health Declaration', value: 'HEALTH_DECLARATION2' },
    { label: 'Personal Information Form', value: 'PERSONAL_FORM' },
    { label: 'Digital Signatures', value: 'DIGITAL_SIGNATURE' },
  ]

  const servicesOptions: {
    id: string
    value: string
    label: string
    text: string
  }[] = [
    {
      id: 'INSURANCE_OPTION_1_GNP_SEGUROS',
      value: 'INSURANCE_OPTION_1_GNP_SEGUROS',
      label: 'GNP Seguros',
      text: 'More benefits, higher cost',
    },
    {
      id: 'INSURANCE_OPTION_2_ALLIANZ',
      value: 'INSURANCE_OPTION_2_ALLIANZ',
      label: 'Allianz México, S.A.',
      text: 'Less benefits, lower cost',
    },
  ]

  const [stage, setStage] = useState<'initial' | 'form' | 'success' | 'approved'>('initial')
  const [signature1, setSignature1] = useState<SignatureData | null>(null)
  const [signature2, setSignature2] = useState<SignatureData | null>(null)
  const [signature1Error, setSignature1Error] = useState(false)
  const [signature2Error, setSignature2Error] = useState(false)

  useEffect(() => {
    setStepControllerNextStepEV('CHOOSE')

    return () => {
      resetStepControllerNextStepEV()
    }
  }, [])

  const onSubmit = async (data: any) => {
    const formData = {
      ...data,
      signature1,
      signature2,
      createdAt: new Date().toISOString(),
    }

    try {
      setIsLoading(true)

      await XanovaServices.submitForm(XanovaFormName.INSURANCE, formData)

      await fetchXanovaFormsFx()
    } catch (error) {
      console.log('ERROR-insurance', error)
    }
    setIsLoading(false)
  }

  const handleSteps = () => {
    if (activeStep === 'CHOOSE') setStepControllerNextStepEV('HEALTH_DECLARATION')
    if (activeStep === 'HEALTH_DECLARATION') setStepControllerNextStepEV('HEALTH_DECLARATION2')
    if (activeStep === 'HEALTH_DECLARATION2') setStepControllerNextStepEV('PERSONAL_FORM')
    if (activeStep === 'PERSONAL_FORM') setStepControllerNextStepEV('DIGITAL_SIGNATURE')
    if (activeStep === 'DIGITAL_SIGNATURE') {
      // Валидация подписей
      let hasError = false
      if (!signature1) {
        setSignature1Error(true)
        hasError = true
      }
      if (!signature2) {
        setSignature2Error(true)
        hasError = true
      }
      if (!hasError) {
        // Если подписи есть, отправляем форму
        handleSubmit(onSubmit)()
      }
    }
  }

  const handleBack = () => {
    if (activeStep === 'CHOOSE') {
      setStage('initial')
    }
    if (activeStep === 'HEALTH_DECLARATION') setStepControllerNextStepEV('CHOOSE')
    if (activeStep === 'HEALTH_DECLARATION2') setStepControllerNextStepEV('HEALTH_DECLARATION')
    if (activeStep === 'PERSONAL_FORM') setStepControllerNextStepEV('HEALTH_DECLARATION2')
    if (activeStep === 'DIGITAL_SIGNATURE') setStepControllerNextStepEV('PERSONAL_FORM')
  }

  if (insuranceForm?.status === XanovaFormStatus.LOADING) return null

  if (insuranceForm?.status === XanovaFormStatus.LOADED && !!insuranceForm.data) {
    return (
      <div className={styles.container}>
        <div className={styles.contentSuccess}>
          <SuccessContentXanova
            title={'Your form has been received'}
            btnText={'Need help or updates? Contact Support'}
            action={goSupportXanova}
            subTitle={'You’ll receive all the details by email shortly'}
          />
        </div>
      </div>
    )
  }

  const initialComponentData = {
    title: 'Activate Life\nInsurance Coverage',
    description:
      'Protect your legacy and secure your family’s future. Complete a\u00A0short health declaration to\u00A0begin your coverage request.',
    btnText: 'Start Application',
    btnAction: () => setStage('form'),
  }

  const formComponent = () => {
    return (
      <StepsLayoutXanova steps={stepsLayoutConfig} activeStep={activeStep} className={styles.width100}>
        <div className={styles.contentWrap}>
          <div className={styles.formWrap}>
            {activeStep === 'CHOOSE' ? (
              <div className={styles.checkboxContainer}>
                <h1 className={styles.title}>Choose a Service</h1>
                <div className={styles.checkboxGroup}>
                  {servicesOptions.map(option => {
                    return (
                      <label
                        key={option.value}
                        className={clsx('radio-wrap-xanova', styles.checkboxWrap)}
                        htmlFor={`insuranceOption-${option.value}`}
                      >
                        <input
                          id={`insuranceOption-${option.value}`}
                          type='radio'
                          value={option.value}
                          {...register('insuranceOption')}
                        />
                        <span className='radio-xanova-box' />
                        <div className={styles.checkboxLabelWrap}>
                          <span className={clsx(styles.checkboxLabel)}>{option.label}</span>
                          <div className={styles.checkboxDescription}>{option.text}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ) : null}
            {activeStep === 'HEALTH_DECLARATION' ? (
              <>
                <h1 className={styles.title}>Health Declaration</h1>
                <div style={{ height: 24 }} />
                <p className={styles.title2}>Question 1</p>
                <div style={{ height: 12 }} />
                <p className={styles.descriptionText}>
                  Have you ever suffered or are currently suffering from&nbsp;any&nbsp;of&nbsp;the&nbsp;following
                  conditions:{'\n'}liver, mental, lung, kidney, neurological, cardiovascular disease, high blood
                  pressure, diabetes, epilepsy, multiple sclerosis, rheumatic fever, HIV/AIDS, cancer, tumors, leukemia,
                  lupus, alcoholism, drug addiction or any other chronic degenerative&nbsp;disease?
                </p>
                <div style={{ height: 36 }} />
                <div className={styles.radioGroup}>
                  <label className={clsx('radio-wrap-xanova')} htmlFor='healthDeclaration-yes'>
                    <input id='healthDeclaration-yes' type='radio' value='yes' {...register('healthDeclaration')} />
                    <span className='radio-xanova-box' />
                    <span className='radio-xanova-text'>Yes</span>
                  </label>

                  <label className={clsx('radio-wrap-xanova')} htmlFor='healthDeclaration-no'>
                    <input id='healthDeclaration-no' type='radio' value='no' {...register('healthDeclaration')} />
                    <span className='radio-xanova-box' />
                    <span className='radio-xanova-text'>No</span>
                  </label>
                </div>
              </>
            ) : null}

            {activeStep === 'HEALTH_DECLARATION2' ? (
              <>
                <h1 className={styles.title}>Health Declaration</h1>
                <div style={{ height: 24 }} />
                <p className={styles.title2}>Question 2</p>
                <div style={{ height: 12 }} />
                <p className={styles.descriptionText}>Have you smoked in the past 12 months?</p>
                <div style={{ height: 36 }} />
                <div className={styles.radioGroup}>
                  <label className={clsx('radio-wrap-xanova')} htmlFor='healthDeclaration2-yes'>
                    <input id='healthDeclaration2-yes' type='radio' value='yes' {...register('healthDeclaration2')} />
                    <span className='radio-xanova-box' />
                    <span className='radio-xanova-text'>Yes</span>
                  </label>

                  <label className={clsx('radio-wrap-xanova')} htmlFor='healthDeclaration2-no'>
                    <input id='healthDeclaration2-no' type='radio' value='no' {...register('healthDeclaration2')} />
                    <span className='radio-xanova-box' />
                    <span className='radio-xanova-text'>No</span>
                  </label>
                </div>
              </>
            ) : null}

            {activeStep === 'PERSONAL_FORM' ? <PersonalInformationForm methods={methods} /> : null}

            {activeStep === 'DIGITAL_SIGNATURE' ? (
              <DigitalSignatures
                onSignature1Change={file => {
                  setSignature1(file)
                  if (file) setSignature1Error(false)
                }}
                onSignature2Change={file => {
                  setSignature2(file)
                  if (file) setSignature2Error(false)
                }}
                signature1Error={signature1Error}
                signature2Error={signature2Error}
              />
            ) : null}

            {activeStep !== 'success' ? (
              <>
                <div style={{ height: 36 }} />
                <div className={styles.btnWrap}>
                  <button
                    type='button'
                    onClick={handleBack}
                    className='btn-with-icon-xanova circle40 spanArrowBackIcon'
                  >
                    <span />
                  </button>

                  <button type={'submit'} className={clsx('btn-xanova gold')}>
                    {isLoading ? (
                      <span className='spinner-border' />
                    ) : activeStep === 'DIGITAL_SIGNATURE' ? (
                      'Submit'
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </StepsLayoutXanova>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleSteps)} className={styles.container}>
      {stage === 'initial' && (
        <InitialFormComponent
          title={initialComponentData.title}
          description={initialComponentData.description}
          btnText={initialComponentData.btnText}
          btnAction={initialComponentData.btnAction}
        />
      )}
      {stage === 'form' && formComponent()}
    </form>
  )
}
