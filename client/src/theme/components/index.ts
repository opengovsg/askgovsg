import { Button } from './Button'
import { StyledToast } from './StyledToast'
import { Pagination, PAGINATION_THEME_KEY } from './Pagination'

export const components = {
  Button,
  StyledToast,
  [PAGINATION_THEME_KEY]: Pagination,
}
