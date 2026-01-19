import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { ErrorRedBlock } from 'components'
import { countriesFormatted } from 'constant'
import { CardFeesResponse, CardService, EDispatchMethod } from 'wip/services'
import { termsOfUseLink } from 'config'
import { $cardStatus, getCardStatusFx } from 'model/cefi-banking'

import { CARD_TOP_UP_FEE_PERCENT } from '../../constant/tier-fee-discounts'
import { $tierLevel } from '../../model/cefi-stacking'
import styles from './styles.module.scss'

type Props = {
  setIsSubmitted: React.Dispatch<any>
}

export function StepTerms({ setIsSubmitted }: Props) {
  const cardStatus = useUnit($cardStatus)
  const userLevel = useUnit($tierLevel)

  const errors = { checkBox: false }

  const [terms, setTerms] = useState([
    {
      title: 'I am not a politically exposed person',
      isChecked: false,
    },
    {
      title: 'I am not represented by someone else',
      isChecked: false,
    },
    {
      title: 'I am the beneficial owner of the card',
      isChecked: false,
    },
  ])

  const [isSummary, setIsSummary] = useState(
    Object.keys(cardStatus?.additionalInfo).length ? cardStatus?.additionalInfo : null
  )
  const [loading, setLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [feesInfo, setFeesInfo] = useState<CardFeesResponse[]>([])

  const getCardIssuanceFeeInfoFetch = async () => {
    setLoading(true)
    try {
      const feeInfoResponse = await CardService.getCardIssuanceFeeInfo('VIRTUAL', EDispatchMethod.DHL_EXPRESS)
      setFeesInfo(feeInfoResponse)
    } catch (error: any) {
      setRequestError(error.code || error.message || 'FEE INFO Error')
      console.log('getCardIssuanceFeeInfo-ERROR', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!feesInfo.length) {
      getCardIssuanceFeeInfoFetch()
    }
  }, [])

  const allTermsIsTrue = !!isSummary || terms.every(term => term.isChecked) //! !cardStatus?.additionalInfo ||

  const issuanceFee = feesInfo.find(fee => fee.type === 'CardIssuanceFixedFee')

  return (
    <div className={styles.stepContentContainer}>
      <div className={clsx(styles.freeHistoryDescription, styles.freeHistoryDescriptionFive)}>
        {isSummary ? (
          'Please review your details and submit your application.'
        ) : (
          <>
            We’re all about transparency.
            <br /> Please review and agree to our{' '}
            <NavLink to={termsOfUseLink()} target='_blank' className={styles.termsLink}>
              Terms of Use
            </NavLink>{' '}
            before we proceed.
          </>
        )}
      </div>

      <div style={{ height: 58 }} />

      {isSummary ? (
        <>
          <div className={styles.summaryBlock}>
            <div className={styles.summaryTitle}>Deposit</div>
            <div className={styles.summaryData}>
              €{isSummary.amount} <span className={styles.summaryConfirmed}> - Confirmed</span>
            </div>
          </div>
          <div className={styles.summaryBlock}>
            <div className={styles.summaryTitle}>Country</div>
            {/*// @ts-ignore*/}
            <div className={styles.summaryData}>{countriesFormatted[isSummary.countryCode]}</div>
          </div>
          <div className={styles.summaryBlock}>
            <div className={styles.summaryTitle}>Address</div>
            <div className={styles.summaryData}>
              {[
                isSummary?.address1,
                isSummary?.address2,
                isSummary?.city,
                isSummary?.countryCode,
                isSummary?.postalCode,
              ]
                .filter(Boolean)
                .join(', ')}
            </div>
          </div>
          <div className={styles.summaryBlock}>
            <div className={styles.summaryTitle}>Mobile</div>
            <div className={styles.summaryData}>{isSummary.phone}</div>
          </div>
          <div className={styles.summaryBlock}>
            <div className={styles.summaryTitle}>Self-Check</div>
            <div className={styles.summaryConfirmed}>Completed</div>
          </div>
          <div className={styles.summaryBlock}>
            <div className={styles.summaryTitle}>Plastic Card Issuance Fee</div>
            <div className={styles.summaryData}>€{issuanceFee?.fixedPart}</div>
          </div>
        </>
      ) : (
        <div className={styles.containerTermsWrap}>
          {terms.map(term => {
            return (
              <label key={term.title} htmlFor={term.title} className={clsx(styles.container)}>
                {term.title}
                <input
                  checked={term.isChecked}
                  id={term.title}
                  type='checkbox'
                  onChange={() => {
                    const newState = terms.map(item => {
                      if (item.title === term.title) {
                        return { ...item, isChecked: !term.isChecked }
                      }
                      return item
                    })
                    setTerms(newState)
                  }}
                />
                <span style={errors.checkBox ? { outline: '1px solid red' } : {}} className={styles.checkmark} />
              </label>
            )
          })}
        </div>
      )}

      <div className={styles.btnHeight} />

      <button
        style={{ marginTop: 80, opacity: allTermsIsTrue ? 1 : 0.5 }}
        onClick={async e => {
          e.preventDefault()
          setLoading(true)
          if (isSummary) {
            try {
              await CardService.submitOrderStatus()
              await getCardStatusFx()
              setIsSubmitted(true)
            } catch (error: any) {
              setRequestError(error.code || 'SUBMITTED Error')
              console.log('submitOrderStatus(TERMS)-SUBMITTED', error)
            }
          } else {
            try {
              const step5 = await CardService.setOrderCardTerms({
                isRepresentedBySomeoneElse: false,
                isBeneficialOwner: true,
                isPoliticallyExposedPerson: false,
              })
              setIsSummary(step5.additionalInfo)
              await getCardStatusFx()
            } catch (error: any) {
              setRequestError(error.code || 'TERMS Error')
              console.log('submitOrderStatus(TERMS)-ERROR', error)
            }

            getCardIssuanceFeeInfoFetch()
          }

          setLoading(false)
        }}
        className='btn-new primary big'
        disabled={!allTermsIsTrue}
      >
        {/* eslint-disable-next-line no-nested-ternary */}
        {loading ? <span className='spinner-border' /> : isSummary ? 'Submit' : <div>Next</div>}
      </button>
      {requestError ? <ErrorRedBlock requestError={requestError} /> : null}
    </div>
  )
}
