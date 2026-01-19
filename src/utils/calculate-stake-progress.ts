import moment from 'moment'

export const calculateStakeProgress = (preparedOpenDate: string, preparedExpectedCloseDate: string) => {
  const openDate = moment(preparedOpenDate)
  const closeDate = moment(preparedExpectedCloseDate)
  const today = moment()

  let progress = 0 // Процент прогресса
  let daysPassed = 0 // Сколько дней прошло
  let daysLeft = 0 // Сколько дней осталось
  let stakeDays = 0 // Общее количество дней между openDate и closeDate

  if (openDate.isValid() && closeDate.isValid()) {
    stakeDays = closeDate.diff(openDate, 'days')
    daysPassed = today.diff(openDate, 'days')
    daysLeft = Math.max(closeDate.diff(today, 'days'), 0)

    if (stakeDays > 0) {
      progress = today.isSameOrAfter(closeDate) ? 100 : (daysPassed / stakeDays) * 100
    }
  }

  return { progress, daysPassed, daysLeft, stakeDays }
}
