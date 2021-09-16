import React from 'react'
import './Spinner.styles.scss'

import { SkeletonText, Spinner as PageSpinner } from '@chakra-ui/react'

interface SpinnerProps {
  type?: string
  width: string | number
  height: string | number
}

const Spinner = ({ type, width, height }: SpinnerProps): JSX.Element => {
  return type === 'paragraph' ? (
    <SkeletonText />
  ) : (
    <div className="spinner" style={{ width: `${width}`, height: `${height}` }}>
      <PageSpinner />
    </div>
  )
}

export default Spinner
