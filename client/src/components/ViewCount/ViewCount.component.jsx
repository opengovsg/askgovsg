import 'boxicons'
import './ViewCount.styles.scss'

import React from 'react'

const ViewCount = ({ views, className }) => {
  return (
    <div className={className}>
      <box-icon color="#A2A8B9" name="show"></box-icon>
      <p>{views}</p>
    </div>
  )
}

export default ViewCount
