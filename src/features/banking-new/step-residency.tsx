import { ReactElement, useState } from 'react'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { CommonDropdown, ErrorRedBlock } from 'components'
import { countriesFormatted } from 'constant'
import { CardService } from 'wip/services'
import { $cardStatus, getCardStatusFx } from 'model/cefi-banking'

import { countriesData } from '../modals/travel-rule-form/countries'
import hodlCard from './card-hodl.svg'
import styles from './styles.module.scss'

export type TCountries = {
  name: string
  code: string
}

export function StepResidency() {
  const cardStatus = useUnit($cardStatus)

  const [selectedCountry, setSelectedCountry] = useState<TCountries>({ name: 'Select Country', code: 'OTHER' })

  const [requestError, setRequestError] = useState('')
  const [loading, setLoading] = useState(false)

  const itemComponentCurrency = (currency: TCountries): ReactElement => {
    const flag = currency.code && countriesData[currency.code] ? countriesData[currency.code].flag : ''
    return (
      <div className={styles.bankName} style={{ marginLeft: 10 }}>
        <div>{flag}</div> {currency.name}
      </div>
    )
  }

  const countries: TCountries[] = ((cardStatus?.additionalInfo?.countryCodes || []) as string[]) // permittedCountries
    // @ts-ignore
    .map(item => ({ code: item, name: countriesFormatted[item] }))
    .sort((a, b) => {
      if (b.code === 'OTHER') return -1
      if (a.name < b.name) {
        return -1
      }
      if (a.name > b.name) {
        return 1
      }
      return 0
    })

  return (
    <div className={styles.stepContentContainer}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img className={clsx(styles.cardImg, styles.cardImgTwo)} src={hodlCard} alt='' />
      </div>
      <div className={clsx(styles.enterAmount, styles.enterAmountTwo)}>Country</div>

      <div className={styles.countryDropDownWrap}>
        <CommonDropdown
          data={countries}
          itemComponent={itemComponentCurrency}
          setSelectedData={setSelectedCountry}
          selectedData={selectedCountry}
        />
      </div>

      <div className={styles.btnHeight} />

      <button
        style={{
          marginTop: 'auto',
          opacity: selectedCountry.name === 'Select Country' ? 0.5 : 1,
        }}
        onClick={async e => {
          e.preventDefault()
          if (selectedCountry.name === 'Select Country') return
          setLoading(true)
          try {
            const stepData = await CardService.setOrderCardResidency({
              countryCode: selectedCountry?.code || 'OTHER',
            })

            await getCardStatusFx()
          } catch (error: any) {
            setRequestError(error.code || 'RESIDENCY Error')
            console.log('submitOrderStatus(RESIDENCY)-ERROR', error)
          }
          setLoading(false)
        }}
        className='btn-new primary big'
      >
        {loading ? <span className='spinner-border' /> : <div>Next</div>}
      </button>

      {requestError ? <ErrorRedBlock requestError={requestError} /> : null}
    </div>
  )
}
