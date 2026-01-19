import { useMemo } from 'react'
import { useUnit } from 'effector-react'

import { WhitelistAddressResponse } from 'wip/services/white-list'
import { $whiteList } from 'model/white-list'

// Refactoring отказаться от переращета на каждый вод символа ?
type FindWhitelistAddressParams = {
  address: string
  networkId: string
  tag: string
  name: string
}

export const useFindWhitelistAddress = ({
  address,
  networkId,
  tag,
  name,
}: FindWhitelistAddressParams): WhitelistAddressResponse | undefined => {
  const whiteList = useUnit($whiteList)

  return useMemo(() => {
    return whiteList.find(item => {
      return item.address === address && item.networkId === networkId && item.tag === tag && item.name === name
    })
  }, [address, networkId, tag, whiteList, name])
}
