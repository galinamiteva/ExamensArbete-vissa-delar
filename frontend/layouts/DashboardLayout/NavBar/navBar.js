import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFirebase } from 'react-redux-firebase';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import InputIcon from '@material-ui/icons/Input';
import {
  AppBar, colors, IconButton, Toolbar, Box, List, makeStyles, useTheme
} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Divider from '@material-ui/core/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LanguageIcon from '@mui/icons-material/Language';
import FaceIcon from '@mui/icons-material/Face';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CoffeeIcon from '@mui/icons-material/Coffee';
import KayakingIcon from '@mui/icons-material/Kayaking';
import RoomIcon from '@mui/icons-material/Room';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import NavItem from './NavItem';
import ProfileNavView from '../../../views/profile-page/ProfileNavView';
import AlertNotification from '../../../components/AlertNotification';
import logo from '../assets/world.png';
import axios from '../../../lib/axios';
import GrandPermition from '../../../utils/GrandPermission';

let items = [];
const itemsAdmin = [
  {
    href: '/dashboard',
    title: 'overview',
    icon: (<DashboardIcon />)
  },

  {
    href: '/customers',
    title: 'Customers',
    icon: (<FaceIcon />)
  },
  {
    href: '/stations',
    title: 'manage_stations',
    icon: (<RoomIcon />)
  },
  {
    href: '/users',
    title: 'Users',
    icon: (<PeopleAltIcon />)
  },
  {
    href: '/products',
    title: 'Products',
    icon: (<KayakingIcon />)
  },
  {
    href: '/sites',
    title: 'Sites',
    icon: (<LanguageIcon />)
  },
  {
    href: '/accounts',
    title: 'Accounts',
    icon: (<AssignmentIndIcon />)
  },
  {
    href: '/checkout-products',
    title: 'Checkout Products',
    icon: (<AttachMoneyIcon />)
  },
  {
    href: '/extra-products',
    title: 'Extra Products',
    icon: (<AddShoppingCartIcon />)
  },
  {
    href: '/contract-products',
    title: 'Contract Products',
    icon: (<CoffeeIcon />)
  },
  {
    href: '/promo-codes',
    title: 'Promo Codes',
    icon: (<ConfirmationNumberIcon />)
  }
];

const itemsBasicAcc = [
  {
    href: '/dashboard',
    title: 'overview',
    icon: (<DashboardIcon />)
  },
  {
    href: '/customers',
    title: 'Customers',
    icon: (<FaceIcon />)
  },
  {
    href: '/stations',
    title: 'manage_stations',
    icon: (<RoomIcon />)
  },
  {
    href: '/products',
    title: 'Products',
    icon: (<KayakingIcon />)
  },
  {
    href: '/sites',
    title: 'Sites',
    icon: (<LanguageIcon />)
  },
  {
    href: '/checkout-products',
    title: 'Checkout Products',
    icon: (<AttachMoneyIcon />)
  },
  {
    href: '/extra-products',
    title: 'Extra Products',
    icon: (<AddShoppingCartIcon />)
  },
  {
    href: '/contract-products',
    title: 'Contract Products',
    icon: (<CoffeeIcon />)
  },
  {
    href: '/promo-codes',
    title: 'Promo Codes',
    icon: (<ConfirmationNumberIcon />)
  }
];

const itemsFreeAcc = [
  {
    href: '/dashboard',
    title: 'overview',
    icon: (<DashboardIcon />)
  },
  {
    href: '/sites',
    title: 'Sites',
    icon: (<LanguageIcon />)
  }
];

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  mobileDrawer: {
    width: 256
  },
  desktopDrawer: {
    width: 256,
    top: 64,
    height: 'calc(100% - 64px)'
  },
  avatar: {
    cursor: 'pointer',
    width: 64,
    height: 64
  },
  flexbox: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  title: {
    color: colors.common.white
  },
  logo: {
    width: 130
  },
  icon: {
    color: colors.common.white
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  hide: {
    display: 'none'
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1
    }
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  }
}));

const NavBar = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  /** ************************Copplat med routeringen******************************************* */

  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);

  async function downloadAccounts() {
    try {
      const response = await axios.get('/adm/accounts');
      const code = response.status;
      if (code >= 200 && code < 300) {
        setAccounts(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function downloadUsers() {
    try {
      const response = await axios.get('/adm/users');
      const code = response.status;
      if (code >= 200 && code < 300) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    downloadAccounts();
    downloadUsers();
    return () => {
        setAccounts([]);
        setUsers([]); // det funkar i stackoverflow
      };
  }, []);

  const getTypeFromAccount = (accountsId) => {
      let accountType = '';
      accounts.forEach((value) => {
        if (accountsId === value.id) {
          accountType = value.type;
        }
      });
      return accountType;
    };

    const getRoleByUsersId = (userId) => {
      let usersRole = null;
      let usersAccountId = null;
      users.forEach((value) => {
        if (userId === value.id) {
          usersRole = value.role;
          usersAccountId = value.accountId;
        }
      });
      return { usersRole, usersAccountId };
    };

  const firebaseG = getFirebase();
  const usersId = firebaseG.auth().currentUser.uid;
  const role = getRoleByUsersId(usersId).usersRole;
  const accountId = getRoleByUsersId(usersId).usersAccountId;
  const grantPermitionResult = GrandPermition(role);

  const currentUserAccountsType = getTypeFromAccount(accountId);
  // console.log('ACCOUNT TYPE', currentUserAccountsType);
  // console.log('grandPermission RESULT', grantPermitionResult);

  if (grantPermitionResult) {
    items = itemsAdmin;
  } else if (!grantPermitionResult && currentUserAccountsType === 'BASIC_ACCOUNT') {
    items = itemsBasicAcc;
  } else {
    items = itemsFreeAcc;
  }

/** ************************************************************************* */
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const toggleDrawer = (openM) => (event) => {
    if (
      event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpen(openM);
  };

  const logout = () => {
    const firebase = getFirebase();
    firebase.logout().then(() => {
      navigate('/auth/login');
    })
      .catch((error) => {
        let { message: errorMessage } = error;
        if (errorMessage === null || errorMessage === '') {
          errorMessage = 'Something went wrong. Please try again later.';
        }
        setMessage(errorMessage);
      });
  };

  const content = (
    <Box className={classes.flexbox}>
      <Box
        display="flex"
        flexDirection="column"
        p={2}
      >
        <List>
          {items.map((item) => (
            <NavItem
              href={item.href}
              key={item.title}
              title={item.title}
              icon={item.icon}
            />
          ))}
        </List>
      </Box>
      <Box>
        <ProfileNavView />
      </Box>
    </Box>
  );

  return (
    <Box className={classes.root}>
      <CssBaseline />
      <AppBar
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open
            })}
          >
            <MenuIcon />
          </IconButton>
          <RouterLink to="/">
            <img src={logo} alt="gokaya-logo" className={classes.logo} />
          </RouterLink>
          <Box flexGrow={1} />
          <IconButton
            color="inherit"
            onClick={logout}
          >
            <InputIcon />
          </IconButton>
        </Toolbar>
        {
          message
          && (
            <AlertNotification
              error={message}
              onClose={() => setMessage('')}
            />
          )
        }
      </AppBar>
      <SwipeableDrawer
        open
        variant="permanent"
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        {content}
      </SwipeableDrawer>
    </Box>
  );
};

export default NavBar;
