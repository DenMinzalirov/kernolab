import { useState } from 'react'
import { useUnit } from 'effector-react'

import { BackButton } from 'components'
import { $isMobile } from 'model'

// import Password from './3DPassword'
// import { CardFees } from './card-fees'
// import CardLimits from './CardLimits'
import styles from './styles.module.scss'

type Props = {
  cardUuid: string
}

//TODO DELETE
function CardSettingsModal({ cardUuid }: Props) {
  const isMobileScreens = useUnit($isMobile)
  const [step, setStep] = useState('setting')

  return (
    <div className={styles.cardSettingsWrap}>
      <div style={{ justifyContent: 'end', display: isMobileScreens ? 'none' : 'flex' }}>
        {!['setting'].includes(step) ? <BackButton backFn={() => setStep('setting')} /> : null}
      </div>

      <div className={styles.contentWrap}>
        {/* {step === 'setting' ? <SettingsStep setStep={setStep} cardUuid={cardUuid} /> : null} */}
        {/* {step === 'cardLimits' ? <CardLimits cardUuid={cardUuid} /> : null} */}
        {/* {step === 'cardFees' ? <CardFees cardUuid={cardUuid} /> : null} */}
        {/* {step === '3DPassword' ? <Password cardUuid={cardUuid} /> : null}
        {step === 'pin' ? <Password isPin cardUuid={cardUuid} /> : null} */}
      </div>
    </div>
  )
}
