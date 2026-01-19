import moment from 'moment'

import { ExtendedAccountStatementRecord } from 'model/card-history'

import { TYPE_TXN_HISTORY } from './constants'

export type GroupedDataCard = {
  [key: string]: ExtendedAccountStatementRecord[]
}

export type SectionCard = {
  title: string
  data: ExtendedAccountStatementRecord[]
}

export const processAndGroupDataForCard = (data: ExtendedAccountStatementRecord[], currentMonth: string) => {
  if (!data.length) return []

  const transactionType: string = data[0].transactionType

  const sections: SectionCard[] = []

  const currentMonthData: ExtendedAccountStatementRecord[] = []
  const otherGroupedData: GroupedDataCard = {}

  if (TYPE_TXN_HISTORY.CARD === transactionType) {
    data.forEach(item => {
      const itemDate = moment(item.purchaseDate)
      const monthYear = itemDate.format('MMMM YYYY')

      if (monthYear === currentMonth) {
        currentMonthData.push(item)
      } else {
        if (!otherGroupedData[monthYear]) {
          otherGroupedData[monthYear] = []
        }
        otherGroupedData[monthYear].push(item)
      }
    })

    currentMonthData.sort((a, b) => moment(b.purchaseDate).diff(moment(a.purchaseDate)))

    if (currentMonthData.length > 0) {
      const groupedByDay = {} as GroupedDataCard

      currentMonthData.forEach(item => {
        const day = moment(item?.purchaseDate || '').format('DD MMMM')
        if (!groupedByDay[day]) {
          groupedByDay[day] = []
        }
        groupedByDay[day].push(item)
      })

      Object.keys(groupedByDay).forEach(day => {
        sections.push({
          title: day,
          data: groupedByDay[day],
        })
      })
    }

    const sortedOtherGroupedData: GroupedDataCard = {}
    Object.keys(otherGroupedData)
      .sort((a, b) => moment(b, 'MMMM YYYY').diff(moment(a, 'MMMM YYYY')))
      .forEach(key => {
        sortedOtherGroupedData[key] = otherGroupedData[key].sort((a, b) =>
          moment(b.purchaseDate).diff(moment(a.purchaseDate))
        )
      })

    Object.keys(sortedOtherGroupedData).forEach(monthYear => {
      sections.push({
        title: monthYear?.split(' ')[0],
        data: sortedOtherGroupedData[monthYear],
      })
    })

    return sections
  } else {
    return []
  }
}
