import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { HeaderTitle } from 'components'
import { pages } from 'constant'
import { TravelRuleForm } from 'features/modals/travel-rule-form'
import { SuccessPairs } from 'features/success-pairs'

import styles from './styles.module.scss'

export function TravelRule() {
  const location = useLocation()
  const navigate = useNavigate()

  const [isSuccess, setIsSuccess] = useState(false)

  if (isSuccess) {
    return (
      <SuccessPairs
        title={'Success!'}
        description={
          'Your wallet verification has been successfully submitted. Please wait while the transaction is\u00A0 being processed.'
        }
        headerTitle={'Travel Rule'}
        btnText='Go Back to Portfolio'
        btnAction={() => {
          navigate(pages.PORTFOLIO.path)
        }}
      />
    )
  }

  const travelRuleData = location?.state || {}
  return (
    <div className={styles.page}>
      <HeaderTitle headerTitle={'Travel Rule'} showBackBtn />

      <div className={styles.container}>
        <TravelRuleForm travelRuleData={travelRuleData} setIsSuccess={setIsSuccess} />
      </div>
    </div>
  )
}
