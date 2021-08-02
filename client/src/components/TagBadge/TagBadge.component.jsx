import React from 'react'
import { Link } from 'react-router-dom'
import { getRedirectURL } from '../../util/urlparser'
import './TagBadge.styles.scss'

const TagBadge = ({ tagName, tagType, agency }) => {
  const TagComponent = <div className="tag-badge">{tagName.toUpperCase()}</div>

  return (
    <Link to={getRedirectURL(tagType, tagName, agency)}> {TagComponent} </Link>
  )
}

export default TagBadge
