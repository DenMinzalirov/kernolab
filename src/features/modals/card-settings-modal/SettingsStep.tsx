import React, { useState } from 'react'
import Switch from 'react-switch'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { RequestError } from 'components'
import { CardService } from 'wip/services'
import { themeGlobalColor } from 'config'
import { $cardsData, getCardsDataFx } from 'model/cefi-banking'
import eye from 'assets/icons/eye.svg'
import triangle from 'assets/icons/triangle.svg'

import { getCssVar } from '../../../utils/get-css-var'
import styles from './styles.module.scss'

const SwitchComponent: React.FC<any> = ({ checked, changeChecked, isDisabled }) => {
  const greenColor = getCssVar('--P-System-Green')
  const whiteColor = getCssVar('--White')
  const deepSpace10Color = '#E8E8E8' //getCssVar('--Deep-Space-10')

  return (
    <div>
      <Switch
        uncheckedIcon={false}
        checkedIcon={false}
        offColor={deepSpace10Color}
        onColor={greenColor}
        offHandleColor={whiteColor}
        onHandleColor={whiteColor}
        height={23}
        width={42}
        handleDiameter={19}
        checked={checked}
        onChange={changeChecked}
        disabled={isDisabled}
      />
    </div>
  )
}

type Props = {
  setStep: any
  cardUuid: string
}
//TODO DELETE
function SettingsStep({ setStep, cardUuid }: Props) {
  const cards = useUnit($cardsData)
  const security = cards.find(card => card.cardUuid === cardUuid)?.security
  const isPhysical = cards.find(card => card.cardUuid === cardUuid)?.type === 'CHIP_AND_PIN'

  const [isLoading, setIsLoading] = useState(false)
  const [requestError, setRequestError] = useState('')

  const handleSecurity = async (type: string): Promise<void> => {
    setIsLoading(true)
    try {
      await CardService.updateSecurity({
        cardUuid,
        // @ts-ignore
        securityData: { ...security, [type]: !security[type] },
      })
      await getCardsDataFx()
    } catch (e: any) {
      console.log('ERROR-handleSecurity', e)
      setRequestError(e.code)
    }
    setIsLoading(false)
  }

  const CardSettingsFields = [
    {
      title: '3DS Password',
      description: 'View your card 3DS Password',
      icon: <img src={eye} alt='' className='icon-eye' style={{ marginRight: 8 }} />,
      action: () => setStep('3DPassword'),
      isSwitch: false,
    },
    {
      title: 'Limits',
      description: 'View card spending limits',
      icon: <img style={{ rotate: '180deg', marginRight: 10 }} src={triangle} alt='' className='icon-eye' />,
      action: () => setStep('cardLimits'),
      isSwitch: false,
    },
    {
      title: 'Fees',
      description: 'View card fees',
      icon: <img style={{ rotate: '180deg', marginRight: 10 }} src={triangle} alt='' className='icon-eye' />,
      action: () => setStep('cardFees'),
      isSwitch: false,
    },
    {
      title: 'Contactless Payment',
      description: 'Turn on/off contactless payments',
      icon: (
        <SwitchComponent
          isDisabled={isLoading}
          checked={security?.contactlessEnabled}
          changeChecked={() => handleSecurity('contactlessEnabled')}
        />
      ),
      isSwitch: true,
    },
    {
      title: 'ATM Withdrawals',
      description: 'Allow/Deny ATM withdrawals',
      icon: (
        <SwitchComponent
          isDisabled={isLoading}
          checked={security?.withdrawalEnabled}
          changeChecked={() => handleSecurity('withdrawalEnabled')}
        />
      ),
      isSwitch: true,
    },
    {
      title: 'Online Transactions',
      description: 'Allow/Deny online transactions',
      icon: (
        <SwitchComponent
          isDisabled={isLoading}
          checked={security?.internetPurchaseEnabled}
          changeChecked={() => handleSecurity('internetPurchaseEnabled')}
        />
      ),
      isSwitch: true,
    },
  ]

  if (isPhysical) {
    CardSettingsFields.unshift({
      title: 'PIN Code',
      description: 'View your card pin code',
      icon: <img src={eye} alt='' className='icon-eye' />,
      action: () => setStep('pin'),
      isSwitch: false,
    })
  }

  return (
    <>
      <div className={styles.title}>
        <div>Settings</div>
      </div>

      {CardSettingsFields.map(cardSettingsItem => {
        return (
          <div
            key={cardSettingsItem.title}
            className={clsx(styles.cardSettingsItemWrap, { [styles.cursorPointer]: !cardSettingsItem.isSwitch })}
            onClick={cardSettingsItem.action}
          >
            <div>
              <div className={styles.cardSettingsItemTitle}>{cardSettingsItem.title}</div>
              <div className={styles.cardSettingsItemDescription}>{cardSettingsItem.description}</div>
            </div>
            <div>{cardSettingsItem.icon}</div>
          </div>
        )
      })}

      <div style={{ height: 77 }} />

      {requestError ? <RequestError requestError={requestError} /> : null}
    </>
  )
}
