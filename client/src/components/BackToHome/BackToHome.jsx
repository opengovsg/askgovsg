import React from 'react'
import { useHistory } from 'react-router-dom'
import 'boxicons'

import './BackToHome.scss'

export const BackToHome = () => {
  const history = useHistory()

  return (
    <div className="back-to-home">
      <button onClick={() => history.goBack()}>
        <box-icon size="sm" color="#69738E" name="arrow-back"></box-icon>
        <div className="back-text">Back</div>
      </button>
    </div>
  )
}
