import { FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { BackButtonBiz } from 'components/back-button-biz'
import { SuccessfullyBiz } from 'components/successfully-biz'
import { pages } from 'constant'

import { useOtcRequest } from './hooks/use-otc-new-trade'
import { OtcStepContactsBiz } from './otc-step-contacts-biz'
import { OtcStepSummaryBiz } from './otc-step-summary-biz'
import { OtcStepTradeDetailsBiz } from './otc-step-trade-details-biz'
import { StepProgressOtcBiz } from './step-progress-otc-biz'
import styles from './styles.module.scss'
import { CONFIG_STEP, STEPS_OTC } from './typeAndConstant'

export function OtcNewTradeBiz() {
  const navigate = useNavigate()
  const { step, isLoading, methods, handleStep, getButtonName, handleBack, errors, disabled, handleSubmit } =
    useOtcRequest()

  return (
    <div className={styles.container}>
      <div
        className={clsx(
          styles.contentWrap,
          [STEPS_OTC.CONSTANTS, STEPS_OTC.SUMMARY].includes(step.id) ? styles.contentWrapFixForStep : ''
        )}
      >
        {[STEPS_OTC.CONSTANTS, STEPS_OTC.SUMMARY].includes(step.id) ? (
          <div className={styles.backBtnWrap}>
            <BackButtonBiz backFn={handleBack} padding={30} />
          </div>
        ) : null}

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleStep)}
            className={clsx(styles.form, { [styles.formFixForSuccess]: step.id === STEPS_OTC.SUCCESS })}
          >
            <div>
              {step.id === STEPS_OTC.TRADE_DETAILS ? (
                <div className={styles.tradeDetailsHeader}>
                  <p className={styles.tradeDetailsHeaderTitle}>OTC Trade</p>
                  <p className={styles.tradeDetailsHeaderSubTitle}>
                    <span className={styles.hideMdAndDown}>
                      To start an OTC trade, select the asset you wish to trade and enter the amount.
                    </span>
                    <br />
                    Provide your contact details, submit the request, and follow further instructions.
                  </p>
                </div>
              ) : null}
              {[STEPS_OTC.TRADE_DETAILS, STEPS_OTC.CONSTANTS, STEPS_OTC.SUMMARY].includes(step.id) ? (
                <div className={styles.stepProgressWrap}>
                  <StepProgressOtcBiz configStep={CONFIG_STEP} currentStep={step.id} />
                </div>
              ) : null}
              {step.id === STEPS_OTC.TRADE_DETAILS ? <OtcStepTradeDetailsBiz methods={methods} /> : null} {/* </div> */}
              {step.id === STEPS_OTC.CONSTANTS ? <OtcStepContactsBiz methods={methods} /> : null}
              {step.id === STEPS_OTC.SUMMARY ? <OtcStepSummaryBiz formData={methods.getValues()} /> : null}
              {step.id === STEPS_OTC.SUCCESS ? (
                <SuccessfullyBiz
                  textData={{
                    title: 'OTC Trade Requested',
                    // eslint-disable-next-line max-len
                    description: `Please follow further\u00A0instructions to complete your\u00A0deposit and\u00A0proceed with\u00A0the offer.`,
                    btnText: 'Return to OTC Dashboard',
                  }}
                  action={() => navigate(pages.OTC.path)}
                />
              ) : null}
            </div>

            {step.id !== STEPS_OTC.SUCCESS ? (
              <div
                className={clsx(styles.buttonWrap, { [styles.buttonWrapFixForSuccess]: step.id === STEPS_OTC.SUCCESS })}
              >
                {errors.amount ? <p className={styles.minAmoutErrorText}>{errors.amount.message}</p> : <div />}
                <button type='submit' className='btn-biz blue big' disabled={disabled || !!errors.amount}>
                  {isLoading ? <span className='spinner-border' /> : getButtonName()}
                </button>

                {[STEPS_OTC.CONSTANTS, STEPS_OTC.SUMMARY].includes(step.id) ? (
                  <div className={styles.showMdAndDown}>
                    <button type='button' onClick={handleBack} className='btn-biz transparent big'>
                      Back
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
