import React from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Button, ListItem, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import Icon from '@mui/material/Icon';

const useStyles = makeStyles((theme) => ({
  item: {
    display: 'flex',
    paddingTop: 0,
    paddingBottom: 0
  },
  button: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    justifyContent: 'flex-start',
    letterSpacing: 0,
    padding: '10px 8px',
    textTransform: 'none',
    width: '100%'
  },
  iconButton: {
    justifyContent: 'flex-start',
  },
  icon: {
    paddingBottom: 35
  },
  title: {
    marginRight: 'auto'
  },
  active: {
    color: theme.palette.primary.main,
    '& $title': {
      fontWeight: theme.typography.fontWeightMedium
    },
    '& $icon': {
      color: theme.palette.primary.main
    }
  }
}));

const NavItem = (
  {
    className,
    href,
    title,
    icon,
    ...rest
  }
) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <ListItem
      className={clsx(classes.item, className)}
      disableGutters
      {...rest}
    >
      <Button
        activeclassname={classes.active}
        className={classes.iconButton}
        component={RouterLink}
        to={href}
      >
        <Icon className={classes.icon}>{icon}</Icon>
      </Button>
      <Button
        activeclassname={classes.active}
        className={classes.button}
        component={RouterLink}
        to={href}
      >
        <span className={classes.title}>
          {t(title)}
        </span>
      </Button>
    </ListItem>
  );
};

NavItem.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string,
  icon: PropTypes.object,
  title: PropTypes.string
};

export default NavItem;
