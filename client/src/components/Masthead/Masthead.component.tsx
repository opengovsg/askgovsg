import React, { FC } from 'react'

import LionHeadSymbol from '../../assets/lion-head-symbol.svg'
import './Masthead.styles.scss'

const Masthead: FC = () => (
  <div id="sg-govt-banner" aria-hidden="false">
    <div className="sgds-masthead">
      <a href="https://www.gov.sg" target="_blank" rel="noopener noreferrer">
        <img src={LionHeadSymbol} alt="Lion Head Symbol" />
        <span className="is-text">A Singapore Government Agency Website</span>
      </a>
    </div>
  </div>
)

export default Masthead
