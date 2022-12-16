import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import firebase from 'firebase/app';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  InputAdornment,
  makeStyles,
  SvgIcon,
  TextField
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from 'react-feather';
/* import { isLoaded, getFirebase } from 'react-redux-firebase'; */
import { isLoaded } from 'react-redux-firebase';
import Page from 'src/components/Page';
import AlertDialog from 'src/components/AlertDialog';
import LoadingComponent from 'src/components/LoadingComponent';

/* import { useNavigate } from 'react-router'; */
import CustomersTable from './CustomersTable';
import CustomersForm from './CustomersForm';
import axios from '../../lib/axios';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  },
  searchField: {
    maxWidth: 1000,
    display: 'flex',
    alignItems: 'center'
  },
  searchButton: {
    marginLeft: theme.spacing(2),
    height: 36
  },
  addNewButton: {
    marginLeft: theme.spacing(2),
    height: 36,
    alignSelf: 'center'
  },
  exportButton: {
    marginLeft: theme.spacing(2),
    height: 36,
    alignSelf: 'center'
  }

}));

const CustomersView = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedcustomer] = useState(null);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [showDeleteAlertModal, setShowDeleteAlertModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const componentRef = useRef();

async function downloadCustomers() {
    try {
      const JWTToken = await firebase.auth().currentUser.getIdToken();
      const response = await axios.get('/adm/customers', {
        headers: {
          Authorization: `Bearer ${JWTToken}`
        }
      });
      const code = response.status;
      if (code >= 200 && code < 300) {
        setCustomers(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  }
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
  // Refreshning efter varje ändring
  useEffect(() => {
    downloadAccounts();
    downloadCustomers();
    downloadUsers();
  }, [setSelectedcustomer, showModal]);
  /* Add en new customer */
  const onAddCustomer = () => {
    setSelectedcustomer(null);
    setShowModal(true);
  };

  const onUpdateCustomer = (e, customer) => {
    e.stopPropagation();
    setSelectedcustomer(customer);
    setShowModal(true);
  };

  const onAskToDeleteCustomer = (e, customer) => {
    e.stopPropagation();
    setSelectedcustomer(customer);
    setShowDeleteAlertModal(true);
  };

  // Delete customer med refreshing
  const deleteCustomer = async (e, customer) => {
    e.stopPropagation();
    setSelectedcustomer(customer);

    try {
      const response = await axios.delete(`/adm/customer/${selectedCustomer.id}`);
      const code = response.status;
      if (code >= 200 && code < 300) {
        setSelectedcustomer(null);
      }
    } catch (err) {
      console.error(err);
    }
    setShowDeleteAlertModal(false);
    /* logout(); */
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const onModalClosed = () => {
    setShowModal(false);
  };

  const onSearchKeyChanged = (e) => {
    setSearchTerm(e.target.value);
  };

 const onCancelSearch = (e) => {
  e.preventDefault();
  setSearchTerm('');
  };
  const onAlertDialogClsed = () => {
    setShowDeleteAlertModal(false);
  };

  const getAccountByName = (accountId) => {
    let accountName = null;

    accounts.forEach((value) => {
      if (accountId === value.id) {
        accountName = value.companyName;
      }
    });
    return accountName;
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

  return (
    <Page
      className={classes.root}
      title={t('customers')}
      ref={componentRef}
    >
      <Container maxWidth={false}>
        <div>
          <Box>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                >
                  <Box className={classes.searchField}>
                    <TextField
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SvgIcon
                              fontSize="small"
                              color="action"
                            >
                              <SearchIcon />
                            </SvgIcon>
                          </InputAdornment>
                        )
                      }}
                      placeholder="Search by first or last name"
                      variant="outlined"
                      onChange={onSearchKeyChanged}
                    />
                    <Button
                      color="primary"
                      variant="contained"
                      className={classes.searchButton}
                      onClick={onCancelSearch}
                      type="reset"
                    >
                      Search
                    </Button>
                  </Box>
                  <Button
                    color="primary"
                    variant="contained"
                    className={classes.exportButton}
                    onClick={handlePrint}
                  >
                    Export
                  </Button>
                  <Button
                    color="primary"
                    variant="contained"
                    className={classes.addNewButton}
                    onClick={onAddCustomer}
                  >
                    Add new customers
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </div>
        <Box mt={3}>
          {isLoaded(customers) ? (
            <CustomersTable
              data={customers}
              searchTerm={searchTerm}
              onUpdateCustomer={onUpdateCustomer}
              onAskToDeleteCustomer={onAskToDeleteCustomer}
              getAccountByName={getAccountByName}
              getRoleByUsersId={getRoleByUsersId}
            />
          ) : <LoadingComponent />}
        </Box>
        <CustomersForm
          showModal={showModal}
          selectedCustomer={selectedCustomer}
          accounts={accounts}
          closeModal={onModalClosed}
          getAccountByName={getAccountByName}
          getRoleByUsersId={getRoleByUsersId}
        />
        <AlertDialog
          showModal={showDeleteAlertModal}
          title="Delete booking?"
          content="Are you sure to delete this booking?"
          onAccept={deleteCustomer}
          closeModal={onAlertDialogClsed}
        />
      </Container>
    </Page>
  );
};

export default CustomersView;
