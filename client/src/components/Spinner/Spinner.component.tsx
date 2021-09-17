import { Center, Spinner as PageSpinner } from '@chakra-ui/react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs'
  thickness?: string
  emptyColor?: string
  color?: string
  speed?: string
}

interface PageSpinnerProps extends SpinnerProps {
  width?: string | number
  height: string | number
}

const Spinner = ({
  width,
  height,
  size,
  thickness,
  emptyColor,
  color,
  speed,
}: PageSpinnerProps): JSX.Element => {
  return (
    <Center className="spinner" h={height} w={width}>
      <PageSpinner
        size={size}
        thickness={thickness}
        emptyColor={emptyColor}
        color={color}
        speed={speed}
      />
    </Center>
  )
}

export default Spinner
