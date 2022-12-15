import React, { useState, useEffect } from 'react';
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
import firebase from 'firebase/app';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from 'react-feather';
import { isLoaded } from 'react-redux-firebase';
import Page from 'src/components/Page';
import AlertDialog from 'src/components/AlertDialog';
import LoadingComponent from 'src/components/LoadingComponent';
import ProductsTable from './ProductsTable';
import ProductsForm from './ProductsForm';
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
  }
}));

const ProductsView = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDeleteAlertModal, setShowDeleteAlertModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  async function downloadProducts() {
    try {
      const JWTToken = await firebase.auth().currentUser.getIdToken();
      const response = await axios.get('/adm/products', {
        headers: {
          Authorization: `Bearer ${JWTToken}`
        }
      });
      const code = response.status;
      if (code >= 200 && code < 300) {
        setProducts(response.data);
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
    downloadProducts();
    downloadUsers();
  }, [selectedProduct, showModal]);
  /* Add en new product */
  const onAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const onUpdateProduct = (e, product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setShowModal(true);
  };

  const onAskToDeleteProduct = (e, product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setShowDeleteAlertModal(true);
  };

  // Delete product med refreshing
  const deleteProduct = async (e, product) => {
    e.stopPropagation();
    setSelectedProduct(product);

    try {
      const response = await axios.delete(`/adm/product/${selectedProduct.id}`);
      const code = response.status;
      if (code >= 200 && code < 300) {
        setSelectedProduct(null);
        /*  refreshProductData(); */
      }
    } catch (err) {
      console.error(err);
    }
    setShowDeleteAlertModal(false);
  };

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
      title={t('products')}
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
                      placeholder="Search by products name"
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
                    className={classes.addNewButton}
                    onClick={onAddProduct}
                  >
                    Add new product
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </div>
        <Box mt={3}>
          {isLoaded(products) ? (
            <ProductsTable
              data={products}
              searchTerm={searchTerm}
              onUpdateProduct={onUpdateProduct}
              onAskToDeleteProduct={onAskToDeleteProduct}
              getAccountByName={getAccountByName}
              getRoleByUsersId={getRoleByUsersId}
            />
          ) : <LoadingComponent />}
        </Box>
        <ProductsForm
          showModal={showModal}
          selectedProduct={selectedProduct}
          accounts={accounts}
          closeModal={onModalClosed}
          getAccountByName={getAccountByName}
          getRoleByUsersId={getRoleByUsersId}
        />
        <AlertDialog
          showModal={showDeleteAlertModal}
          title="Delete product?"
          content="Are you sure to delete this product?"
          onAccept={deleteProduct}
          closeModal={onAlertDialogClsed}
        />
      </Container>
    </Page>
  );
};

export default ProductsView;
