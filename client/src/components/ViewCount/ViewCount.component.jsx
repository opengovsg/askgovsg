import { BiShow } from 'react-icons/bi'
import './ViewCount.styles.scss'

const ViewCount = ({ views, className }) => {
  return (
    <div className={className}>
      <BiShow style={{ marginRight: '10px' }} size="24" color="secondary.300" />
      <p>{views}</p>
    </div>
  )
}

export default ViewCount
