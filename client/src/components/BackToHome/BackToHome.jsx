import { useHistory } from 'react-router-dom'
import { BiArrowBack } from 'react-icons/bi'

import './BackToHome.scss'

export const BackToHome = () => {
  const history = useHistory()

  return (
    <div className="back-to-home">
      <button onClick={() => history.goBack()}>
        <BiArrowBack
          style={{ marginRight: '8px' }}
          size="24"
          color="secondary.400"
        />
        <div className="back-text">Back</div>
      </button>
    </div>
  )
}
