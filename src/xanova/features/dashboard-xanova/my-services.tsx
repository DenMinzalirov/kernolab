import { useNavigate } from 'react-router-dom'
import { useUnit } from 'effector-react'
import clsx from 'clsx'

import { pages } from 'constant'
import {
  $accountingSupportForm,
  $fiscalStrategyForm,
  $insuranceForm,
  $tradingInvestmentsForm,
} from 'model/xanova-forms'

import styles from './styles.module.scss'
import { StatusPill } from 'xanova/components/status-pill'

export function MyServices() {
  const navigate = useNavigate()
  const insuranceForm = useUnit($insuranceForm)
  const tradingInvestmentsForm = useUnit($tradingInvestmentsForm)
  const accountingSupportForm = useUnit($accountingSupportForm)
  const fiscalStrategyForm = useUnit($fiscalStrategyForm)

  const inactiveDataFormStatus = insuranceForm.data?.status
  const tradingInvestmentsFormStatus = tradingInvestmentsForm.data?.status
  const accountingSupportFormStatus = accountingSupportForm.data?.status
  const fiscalStrategyFormStatus = fiscalStrategyForm.data?.status

  const MY_SERVICES = [
    {
      id: 'insurance',
      title: 'Insurance',
      description: '',
      // description: 'Policy Issued',
      status: inactiveDataFormStatus || 'inactive',
      action: () => {
        navigate(pages.INSURANCE.path)
      },
    },
    {
      id: 'trading',
      title: 'Trading',
      description: '',
      // description: 'Balance: $12,500 (+4.2%)',
      status: tradingInvestmentsFormStatus || 'inactive',
      action: () => {
        navigate(pages.TRADING_INVESTMENTS.path)
      },
    },
    {
      id: 'advisory',
      title: 'Advisory (Start Rep)',
      description: '',
      // description: '12 Sep. 15:00 CET',
      status: accountingSupportFormStatus || fiscalStrategyFormStatus || 'inactive',
      action: () => {
        navigate(pages.START_REP.path)
      },
    },
  ]
  return (
    <div className={clsx(styles.gridBlock, styles.bottomLeftWidget)}>
      <h4 className={styles.title}>My Services</h4>

      <div className={styles.flexVerticalGap16}>
        {MY_SERVICES.map(service => (
          <div key={service.id} className={styles.myServicesBlock} onClick={service.action}>
            <div className={styles.flexVerticalGap8}>
              <div className={clsx(styles.mediumText)}>{service.title}</div>
              {service.description && (
                <div className={clsx(styles.smallText, styles.opacity07)}>{service.description}</div>
              )}
            </div>
            <div>
              <StatusPill status={service.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
