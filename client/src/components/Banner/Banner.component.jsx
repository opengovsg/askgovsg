import React from 'react'
import { useEnvironment } from '../../hooks/useEnvironment'

import './Banner.styles.scss'

export const Banner = () => {
  const { data, isSuccess } = useEnvironment()
  return isSuccess && data.bannerMessage ? (
    <div className="banner">{data.bannerMessage}</div>
  ) : null
}
