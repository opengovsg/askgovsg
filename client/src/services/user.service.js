export const isUserPublicOfficer = (user) =>
  !!user?.username?.endsWith('.gov.sg')

export const hasAnswerPermissions = (user, post) => {
  const hasAnswerPermissions = post.tags.every((postTag) => {
    const userTag = user.tags.find((userTag) => userTag.id === postTag.id)
    return (
      userTag && userTag.permission && userTag.permission.role === 'answerer'
    )
  })
  return hasAnswerPermissions
}
