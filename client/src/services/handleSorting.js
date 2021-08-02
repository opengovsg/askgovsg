const handleSorting = (sortType, page = '') => {
  let temp = sortType

  if (page === 'users' && temp === 'Name') {
    temp = 'Username'
  } else if (page === 'users' && temp === 'Popular') {
    temp = 'Popular users'
  }

  switch (temp) {
    case 'Newest':
      return (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    case 'New':
      return (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    case 'New Users':
      return (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    case 'Top':
      return (a, b) =>
        b.answer_count + b.comment_count - (a.answer_count + a.comment_count)
    case 'Active':
      return (a, b) =>
        b.posts_count + b.tags_count - (a.posts_count + a.tags_count)
    case 'Views':
      return (a, b) => b.views - a.views
    case 'Oldest':
      return (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    case 'Popular':
      return (a, b) => b.posts_count - a.posts_count
    case 'Name':
      return (a, b) => a.tagname.localeCompare(b.tagname)
    case 'Username':
      return (a, b) => a.username.localeCompare(b.username)
    case 'Popular users':
      return (a, b) => b.views - a.views
    default:
      break
  }
}

export default handleSorting
