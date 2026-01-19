import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import xanovaPlusSVG from '../../../assets/icons/xanova-plus.svg'
import {
  $accountingSupportForm,
  $fiscalStrategyForm,
  fetchXanovaFormsFx,
  XanovaFormName,
  XanovaFormStatus,
} from '../../../model'
import {
  $stepControllerNextStep,
  resetStepControllerNextStepEV,
  setStepControllerNextStepEV,
} from '../../../model/step-controller'
import { XanovaServices } from '../../../wip/services'
import { InitialFormComponent } from '../../components/initialFormComponent'
import { StepsLayoutXanova } from '../../components/steps-layout'
import { ProvideYourDetails } from './provide-your-details'
import { ReceivedForm } from './received-form'
import styles from './styles.module.scss'

const defaultValues: InputsRepForm = {
  accountingComplianceSupport: '',
  fiscal: '',
  businessType: 'corporation',
  country: '',
  revenueRange: '',
  contactMethod: '',
}

export type InputsRepForm = {
  accountingComplianceSupport: string
  fiscal: string
  businessType: string
  country: string
  revenueRange: string
  contactMethod: string
}

export function StartRep() {
  const activeStep = useUnit($stepControllerNextStep)
  const accountingSupportForm = useUnit($accountingSupportForm)
  const fiscalStrategyForm = useUnit($fiscalStrategyForm)

  const methods = useForm({ defaultValues })
  const { handleSubmit, register, watch, reset } = methods

  const stepsLayoutConfig = [
    { label: 'Choose a Service', value: 'CHOOSE' },
    { label: 'Request Form', value: 'REQUEST' },
  ]

  const [stage, setStage] = useState<'initial' | 'form' | 'success' | 'approved'>('initial')
  const [isAddNewForm, setAddNewForm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setStepControllerNextStepEV('CHOOSE')

    return () => {
      resetStepControllerNextStepEV()
    }
  }, [])

  const onSubmit = async (data: any) => {
    const formData = {
      ...data,
      createdAt: new Date().toISOString(), // ISO 8601 формат: 2024-01-15T10:30:00.000Z
    }
    delete formData.accountingComplianceSupport
    delete formData.fiscal

    try {
      setIsLoading(true)
      if (data.accountingComplianceSupport) {
        await XanovaServices.submitForm(XanovaFormName.ACCOUNTING_SUPPORT, formData)
      }
      if (data.fiscal) {
        await XanovaServices.submitForm(XanovaFormName.FISCAL_STRATEGY, formData)
      }

      await fetchXanovaFormsFx()
      reset()
      setStepControllerNextStepEV('CHOOSE')
      setAddNewForm('')
    } catch (e) {
      console.log('ERROR-onSubmit-Form-fiscal-ACCOUNTING_SUPPORT', e)
    }
    setIsLoading(false)
  }

  const handleSteps = () => {
    if (activeStep === 'CHOOSE') setStepControllerNextStepEV('REQUEST')
    if (activeStep === 'REQUEST') {
      handleSubmit(onSubmit)()
    }
  }

  const handleBack = () => {
    if (activeStep === 'CHOOSE') {
      if (isAddNewForm) {
        setAddNewForm('')
      } else {
        setStage('initial')
      }
    }
    if (activeStep === 'REQUEST') setStepControllerNextStepEV('CHOOSE')
  }

  const accountingComplianceSupport = watch('accountingComplianceSupport')
  const fiscal = watch('fiscal')

  const handleDisabled = () => {
    if (activeStep === 'CHOOSE') {
      return !accountingComplianceSupport && !fiscal
    }
    return false
  }

  const handleAddForm = (value: string) => {
    setAddNewForm(value)
    setStage('form')
  }

  // Drag to scroll functionality
  const containerRef = useRef<HTMLDivElement>(null)

  // Проверка загруженных форм
  const isAccountingLoaded = accountingSupportForm.status === XanovaFormStatus.LOADED
  const isFiscalLoaded = fiscalStrategyForm.status === XanovaFormStatus.LOADED
  const hasAnyFormLoaded = isAccountingLoaded || isFiscalLoaded
  const hasAccountingData = isAccountingLoaded && !!accountingSupportForm.data
  const hasFiscalData = isFiscalLoaded && !!fiscalStrategyForm.data
  const showFormsCarousel = hasAccountingData || hasFiscalData

  useEffect(() => {
    const container = containerRef.current
    if (!container || !showFormsCarousel) return

    // Проверка ширины экрана и количества форм
    const formsCount = (hasAccountingData ? 1 : 0) + (hasFiscalData ? 1 : 0)
    const isTwoFormsOnWideScreen = formsCount === 2 && window.innerWidth >= 900

    // На широких экранах с 2 формами не нужен drag
    if (isTwoFormsOnWideScreen) {
      container.style.cursor = 'default'
      return
    }

    let isDown = false
    let startX = 0
    let scrollLeft = 0

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      container.style.cursor = 'grabbing'
      container.style.userSelect = 'none'
      startX = e.pageX - container.offsetLeft
      scrollLeft = container.scrollLeft
    }

    const handleMouseLeave = () => {
      isDown = false
      container.style.cursor = 'grab'
      container.style.userSelect = 'auto'
    }

    const handleMouseUp = () => {
      isDown = false
      container.style.cursor = 'grab'
      container.style.userSelect = 'auto'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 2
      container.scrollLeft = scrollLeft - walk
    }

    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [showFormsCarousel, hasAccountingData, hasFiscalData])

  if (hasAnyFormLoaded && !isAddNewForm) {
    if (hasAccountingData || hasFiscalData) {
      const formsCount = (hasAccountingData ? 1 : 0) + (hasFiscalData ? 1 : 0)
      const showNewRequestBlock = formsCount === 1
      const hasTwoForms = formsCount === 2

      return (
        <div
          ref={containerRef}
          className={clsx(styles.containerScroll, { [styles.twoFormsLayout]: hasTwoForms })}
          style={{ cursor: 'grab' }}
        >
          {hasAccountingData && (
            <ReceivedForm formData={accountingSupportForm?.data?.formData} formName={'Accounting'} />
          )}
          {hasFiscalData && <ReceivedForm formData={fiscalStrategyForm.data?.formData} formName={'Fiscal Strategy'} />}

          {showNewRequestBlock && (
            <div
              onClick={() =>
                handleAddForm(hasAccountingData ? XanovaFormName.FISCAL_STRATEGY : XanovaFormName.ACCOUNTING_SUPPORT)
              }
              className={styles.newRequestWrap}
            >
              <img alt={''} src={xanovaPlusSVG} style={{ height: 42 }} />
              <div style={{ width: 150 }} className={styles.contactSupport}>
                Create a New Request
              </div>
            </div>
          )}
        </div>
      )
    }
  }

  const isAccountingLoading = accountingSupportForm.status === XanovaFormStatus.LOADING
  const isFiscalLoading = fiscalStrategyForm.status === XanovaFormStatus.LOADING
  const hasAnyFormLoading = isAccountingLoading || isFiscalLoading

  if (hasAnyFormLoading) return null

  const initialComponentData = {
    title: 'Request Accounting\n&\u00A0Fiscal Consulting',
    description:
      'Access expert advice on accounting compliance and fiscal strategy. Submit your request below and our partner advisory team will contact you.',
    btnText: 'Start Request',
    btnAction: () => setStage('form'),
  }

  const servicesOptions: { id: string; value: string; label: string; fieldName: keyof InputsRepForm; text: string }[] =
    [
      {
        id: XanovaFormName.ACCOUNTING_SUPPORT,
        value: 'compliance',
        label: 'Accounting Compliance Support',
        fieldName: 'accountingComplianceSupport',
        text: 'Guidance with filings, reporting, and regulatory checks to keep your business compliant.',
      },
      {
        id: XanovaFormName.FISCAL_STRATEGY,
        value: 'fiscal',
        label: 'Fiscal Strategy & Optimization',
        fieldName: 'fiscal',
        text: 'Tailored tax and financial planning to minimize costs and improve profitability.',
      },
    ]

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
                    const isDisabled = !!isAddNewForm && option.id !== isAddNewForm
                    return (
                      <label
                        style={isDisabled ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                        key={option.value}
                        className={clsx('checkbox-wrap-xanova', styles.checkboxWrap)}
                      >
                        <input
                          disabled={isDisabled}
                          type='checkbox'
                          value={option.value}
                          {...register(option.fieldName)}
                        />
                        <span style={{ minWidth: 15 }} className='checkbox-xanova-box' />
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

            {activeStep === 'REQUEST' ? <ProvideYourDetails methods={methods} /> : null}

            <div style={{ height: 24 }} />
            <div className={styles.btnWrap}>
              <button type='button' onClick={handleBack} className='btn-with-icon-xanova circle40 spanArrowBackIcon'>
                <span />
              </button>

              <button disabled={handleDisabled()} type={'submit'} className={clsx('btn-xanova gold')}>
                {isLoading ? <span className='spinner-border' /> : 'Next'}
              </button>
            </div>
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
