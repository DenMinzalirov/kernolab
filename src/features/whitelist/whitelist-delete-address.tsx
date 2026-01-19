import { useState } from 'react'

import { Modal } from 'components'

import { getWhiteListFx } from '../../model/white-list'
import { WhitListServices } from '../../wip/services/white-list'
import styles from './styles.module.scss'

const STEP = {
  CONFIRM: 'CONFIRM',
  SUCCESS: 'SUCCESS',
}

type Props = {
  id: string
}

export const WhitelistDeleteAddress = ({ id }: Props) => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(STEP.CONFIRM)

  const deleteAddress = async () => {
    setLoading(true)
    try {
      await WhitListServices.deleteAddressWhitelist(id)
      await getWhiteListFx()

      setStep(STEP.SUCCESS)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      {step === STEP.CONFIRM ? (
        <div className={styles.modalContainer}>
          <div className={styles.modalTextWrap}>
            <div className={styles.modalTitle}>Delete Address?</div>
            <div className={styles.modalSubTitle}>
              The data will&nbsp;be&nbsp;permanently removed. However, you will always be able to&nbsp;add
              a&nbsp;trusted address again in&nbsp;the&nbsp;future.
            </div>
          </div>

          <div className={styles.modalBtnWrap}>
            <button className={'btn-new red'} onClick={() => Modal.close()}>
              {loading ? <span className='spinner-border' /> : 'Cancel'}
            </button>
            <button className={'btn-new transparent'} onClick={deleteAddress}>
              {loading ? <span className='spinner-border' /> : 'Delete'}
            </button>
          </div>
        </div>
      ) : null}

      {step === STEP.SUCCESS ? (
        <div className={styles.modalSuccessContainer}>
          <div className={styles.modalSuccessTextWrap}>
            <div className={styles.modalTitle}>Address Deleted Successfully</div>
            <div className={styles.modalSubTitle}>
              This means that the contact is no longer part of the whitelist, and any special permissions or exemptions
              they had have been removed.
            </div>
          </div>
          <button className={'btn-new primary'} onClick={() => Modal.close()}>
            Return to Whitelist
          </button>
        </div>
      ) : null}
    </>
  )
}
