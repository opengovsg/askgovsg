import React from 'react'
import { useQuery } from 'react-query'
import { matchPath, Link, useLocation } from 'react-router-dom'
import { ReactComponent as Logo } from '../../assets/LogoAlpha.svg'
import {
  getAgencyByShortName,
  GET_AGENCY_BY_SHORTNAME_QUERY_KEY,
} from '../../services/AgencyService'
import { useAuth } from '../../contexts/AuthContext'
import LinkButton from '../LinkButton/LinkButton.component'
import Spinner from '../Spinner/Spinner.component'
import './Header.styles.scss'
import { Text } from '@chakra-ui/react'

const Header = () => {
  const { user, logout } = useAuth()

  const location = useLocation()
  const match = matchPath(location.pathname, {
    path: '/agency/:agency',
  })
  const agencyShortName = match?.params?.agency
  const { isLoading, data: agency } = useQuery(
    [GET_AGENCY_BY_SHORTNAME_QUERY_KEY, agencyShortName],
    () => getAgencyByShortName({ shortname: agencyShortName }),
    { enabled: !!agencyShortName },
  )
  const authLinks = (
    <div className="btns">
      {isLoading || user === null ? (
        <Spinner width="50px" height="50px" />
      ) : (
        <>
          <span>{user.displayname}</span>
          <img
            alt="user-logo"
            className="logo"
            src={`https://secure.gravatar.com/avatar/${user.id}?s=164&d=identicon`}
          />
        </>
      )}
      <LinkButton
        text={'Log out'}
        link={'/login'}
        type={'s-btn__filled'}
        handleClick={logout}
      />
    </div>
  )

  return (
    <>
      <nav className="navbar">
        <Link
          className="navbar-brand"
          to={agency ? `/agency/${agency.shortname}` : '/'}
        >
          <Logo className="askgov-name" />
          {agency ? (
            <>
              <Text
                d={{ base: 'none', md: 'inline' }}
                mr={{ base: 0, md: 4 }}
                textStyle="h4"
                fontWeight={300}
              >
                |
              </Text>
              <Text
                position={{ base: 'relative', md: 'static' }}
                top={{ base: '-6px', md: 0 }}
                textStyle="h4"
                fontWeight={400}
              >
                {agency.longname}
              </Text>
            </>
          ) : null}
        </Link>
        {user && authLinks}
      </nav>
    </>
  )
}

export default Header
