import { useContext, useCallback, useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import fetch from 'isomorphic-unfetch';
import { isObject } from 'lodash';

import { useTheme, makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import Hidden from '@material-ui/core/Hidden';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';

import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import AppTheme from './theme/AppTheme';
import AppUser from './auth/AppUser';

import fullURL from './helpers/URL';

const useStyles = makeStyles((theme) => ({
  navbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column'
    }
  },
  brandLink: {
    color: theme.palette.common.white,
    '&:hover': {
      color: theme.palette.common.white,
      textDecoration: 'none'
    }
  },
  showMenu: {
    display: 'flex',
    alignItems: 'center'
  },
  hideMenu: {
    display: 'none',
    alignItems: 'center',
    verticalAlign: 'middle'
  },
  menu: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-end'
    }
  },
  username: {
    maxWidth: 300,
    whiteSpace: 'pre-wrap',
    fontWeight: 700
  }
}));

function Header() {
  const [fetchingUser, setFetchingUser] = useState(true);
  const [menuExpand, setMenuExpand] = useState(false);
  const themeContext = useContext(AppTheme);
  const userContext = useContext(AppUser);
  const theme = useTheme();
  const matchDownXS = useMediaQuery(theme.breakpoints.down('xs'), { noSsr: true });
  const classes = useStyles();
  const router = useRouter();

  useEffect(() => {
    fetch(fullURL('/api/user'), {
      method: 'POST',
      credentials: 'same-origin',
      mode: 'same-origin'
    })
      .then(async (response) => {
        const json = await response.json();
        if (isObject(json)) {
          userContext.setUser(json);
        } else {
          userContext.setUser(null);
        }
      })
      .catch(() => {
        userContext.setUser(null);
      })
      .finally(() => {
        setFetchingUser(false);
      });
  }, []);

  const themeIcon = useCallback(() => {
    if (themeContext.theme === 'dark') {
      return 'brightness_2';
    }
    return 'brightness_high';
  }, [themeContext.theme]);

  const toggleMenu = useCallback(() => {
    setMenuExpand(!menuExpand);
  }, [menuExpand]);

  const signOut = useCallback(() => {
    userContext.setUser(null);
    fetch(fullURL('/api/signout'), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'same-origin'
    })
      .then((res) => {
        if (res.ok) {
          router.reload();
        }
      })
      .catch(console.error);
  }, []);

  const Account = useCallback(() => {
    if (isObject(userContext.user)) {
      const { id, username, info } = userContext.user;
      if (matchDownXS) {
        return (
          <Box className={clsx([classes.menu])}>
            <Box display="flex" alignItems="center" justifyContent="flex-end" py={1}>
              <img src={info.image} width={30} height={30} />
              <NextLink href={`/user/${id}`} as={`/user/${id}`} prefetch={false}>
                <Link href={`/user/${id}`} as={`/user/${id}`}>
                  <Typography component="h3">
                    <strong>{username}</strong>
                  </Typography>
                </Link>
              </NextLink>
            </Box>
            <Divider color={theme.palette.divider} />
            <Box display="flex" alignItems="center" justifyContent="flex-end" py={1} onClick={signOut}>
              <Icon>exit_to_app</Icon>&nbsp;<strong>Sign Out</strong>
            </Box>
          </Box>
        );
      }
      return (
        <Box className={clsx([classes.menu])}>
          <UncontrolledDropdown>
            <DropdownToggle tag="span" caret>
              <img src={info.image} width={30} height={30} />
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem className={clsx([classes.username])}>
                <NextLink href={`/user/${id}`} as={`/user/${id}`} prefetch={false}>
                  <Link color="primary" href={`/user/${id}`}>
                    {username}
                  </Link>
                </NextLink>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={signOut}>Sign out</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Box>
      );
    }
    return (
      <Box display="flex" alignItems="center" justifyContent="flex-end" py={1}>
        <NextLink href="/signin" as={{ path: '/signin' }} prefetch={false}>
          <Button variant="text">Sign in</Button>
        </NextLink>
        &nbsp;&nbsp;
        <NextLink href="/signup" as={{ path: '/signup' }} prefetch={false}>
          <Button variant="outlined">Sign up</Button>
        </NextLink>
      </Box>
    );
  }, [userContext.user, matchDownXS]);

  return (
    <AppBar color="default" position="static">
      <Container maxWidth="xl">
        <Box className={clsx([classes.navbar])}>
          <Box display="flex" justifyContent="space-between" flexGrow={1}>
            <Box
              bgcolor={theme.palette.primary.main}
              color={theme.palette.common.white}
              display="flex"
              alignItems="center"
              alignSelf="stretch"
              px={theme.spacing(0.5)}
            >
              <NextLink href="/" prefetch={false}>
                <Link className={clsx(classes.brandLink)} href="/">
                  <Typography>
                    <strong>OpenLMS</strong>
                  </Typography>
                </Link>
              </NextLink>
            </Box>
            <Box>
              <IconButton color="default">
                <Icon color="inherit">search</Icon>
              </IconButton>
              <IconButton color="default" onClick={themeContext.toggleTheme}>
                <Icon color="inherit">{themeIcon()}</Icon>
              </IconButton>
              <Hidden smUp>
                <IconButton color="default" onClick={toggleMenu}>
                  <Icon color="inherit">menu</Icon>
                </IconButton>
              </Hidden>
            </Box>
          </Box>
          <NoSsr>
            <Box
              className={clsx({
                [classes.showMenu]: !matchDownXS,
                [classes.hideMenu]: matchDownXS && !menuExpand
              })}
            >
              {fetchingUser ? <CircularProgress color="primary" /> : <Account />}
            </Box>
          </NoSsr>
        </Box>
      </Container>
    </AppBar>
  );
}

export default Header;
