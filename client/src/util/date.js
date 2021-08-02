import moment from 'moment-timezone'

export const dateToDaysAgo = (date) => moment().diff(date, 'days')

export const dateToDaysAgoString = (date) => {
  const daysAgo = dateToDaysAgo(date)
  if (daysAgo < 0) {
    return 'In the future'
  } else if (daysAgo <= 1) {
    return 'Less than 1 day ago'
  } else if (daysAgo < 30) {
    return `${daysAgo} days ago`
  } else {
    return moment(date).format('D MMM, YYYY')
  }
}
