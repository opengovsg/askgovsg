const toTitleCase = (word: string): string => {
  const lowercase = word.toLowerCase()
  return lowercase[0].toUpperCase() + lowercase.slice(1)
}

export const getOfficerDisplayName = (email: string): string => {
  const namePortion = email.split('@')[0]
  const nameParts = namePortion.split('_').map((word) => toTitleCase(word))
  return nameParts.join(' ')
}
