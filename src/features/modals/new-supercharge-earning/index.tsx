import { Dispatch, SetStateAction } from 'react'

import { StakingCampaignContractResponse } from '../../../wip/services'
// import { SuperchargeList } from './supercharge-list'

type Props = {
  setIsSupercharge: Dispatch<SetStateAction<boolean>>
  stakeItem?: StakingCampaignContractResponse
}

//TODO old DELETE

function NewSuperchargeEarningModal({ setIsSupercharge, stakeItem }: Props) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {/* <SuperchargeList stakeItem={stakeItem} setIsSupercharge={setIsSupercharge} /> */}
    </div>
  )
}
