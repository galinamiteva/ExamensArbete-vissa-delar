import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import {
  Box, Card, IconButton, makeStyles, Switch, Typography
} from '@material-ui/core';
import firebase from 'firebase/app';
import { getFirebase } from 'react-redux-firebase';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
/* import generatePinCode from '../../../utils/generatePinCode'; */
import GrandPermition from '../../../utils/GrandPermission';
import axios from '../../../lib/axios';

const useStyles = makeStyles((theme) => ({
  closeIcon: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  selectLabel: {
    marginTop: 16
  }
}));

const ProductsForm = ({
  showModal,
  selectedProduct,
  closeModal,
  accounts,
  getAccountByName,
  getRoleByUsersId
}) => {
  const classes = useStyles();

  const firebaseG = getFirebase();
  const usersId = firebaseG.auth().currentUser.uid;
  const accIdFromRedux = getRoleByUsersId(usersId).usersAccountId;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: selectedProduct ? selectedProduct.name : '',
      hourPrice: selectedProduct ? selectedProduct.hourPrice : '',
      accountId: accIdFromRedux,
      imageUrl: selectedProduct ? selectedProduct.imageUrl : '',
      status: selectedProduct ? selectedProduct.status === 'Active' : false,

    },
    validationSchema: Yup.object().shape({
      name: Yup.string().min(1).required('Please write a name'),
      hourPrice: Yup.string().min(1).required('Please write a price'),
      accountId: Yup.string().required(),
      imageUrl: Yup.string().required(),
      status: Yup.bool(),
    }),

    onSubmit: async (values, { resetForm }) => {
      values = {
        name: values.name,
        hourPrice: values.hourPrice,
        accountId: values.accountId,
        imageUrl: values.imageUrl,
        status: values.status ? 'Active' : 'Inactive',

      };
      if (selectedProduct !== null) {
        try {
          // Update product
          const JWTToken = await firebase.auth().currentUser.getIdToken();
          const response = await axios.patch(`/adm/product/${selectedProduct.id}`, values, {
            headers: {
              Authorization: `Bearer ${JWTToken}`
            }
          });
          const code = response.status;
          if (code >= 200 && code < 300) {
            console.log(response.data);
            formik.setSubmitting(false);
            closeModal();
            resetForm({ values: '' });
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        values = { ...values };
        try {
          // Create new product
          const JWTToken = await firebase.auth().currentUser.getIdToken();
          const response = await axios.post('/adm/product', values, {
            headers: {
              Authorization: `Bearer ${JWTToken}`
            }
          });
          const code = response.status;
          if (code >= 200 && code < 300) {
            console.log(response.data);
            formik.setSubmitting(false);
            closeModal();
            resetForm({ values: '' });
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  });

  const role = getRoleByUsersId(usersId).usersRole;
  const grantPermitionResult = GrandPermition(role);

// if user är ACCOUNT_USER
if (!grantPermitionResult) {
  return (
    <Dialog open={showModal} aria-labelledby="form-dialog-title">
      <Card
        style={{ padding: 24 }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Box>
            <Typography
              color="textPrimary"
              variant="h2"
              align="center"
            >
              {selectedProduct ? 'Edit product' : 'Add new product'}
            </Typography>
            <IconButton aria-label="close" className={classes.closeIcon} onClick={closeModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            error={Boolean(formik.touched.name && formik.errors.name)}
            fullWidth
            helperText={formik.touched.name && formik.errors.name}
            label="Name"
            margin="normal"
            name="name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="text"
            value={formik.values.name}
          />
          <TextField
            error={Boolean(formik.touched.hourPrice && formik.errors.hourPrice)}
            fullWidth
            helperText={formik.touched.hourPrice && formik.errors.hourPrice}
            label="Price"
            margin="normal"
            name="hourPrice"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="number"
            value={formik.values.hourPrice}
          />
          <TextField
            error={Boolean(formik.touched.imageUrl && formik.errors.imageUrl)}
            fullWidth
            helperText={formik.touched.imageUrl && formik.errors.imageUrl}
            label="Image"
            margin="normal"
            name="imageUrl"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="text"
            value={formik.values.imageUrl}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Account"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            margin="normal"
            name="companyName"
            type="text"
            value={getAccountByName(accIdFromRedux)}
          />
          <Box
            alignItems="center"
            display="flex"
            ml={-1}
          >
            <Switch
              checked={formik.values.status}
              name="status"
              onChange={formik.handleChange}
            />
            <Typography
              color="textSecondary"
            >
              Active
            </Typography>
          </Box>
          <Box my={2}>
            <Button
              color="primary"
              disabled={formik.isSubmitting}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              {selectedProduct ? 'Save' : 'Add product'}
            </Button>
          </Box>
        </form>
      </Card>
    </Dialog>
  );
}
// if usern är ADMIN_USER
return (
  <Dialog open={showModal} aria-labelledby="form-dialog-title">
    <Card
      style={{ padding: 24 }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Box>
          <Typography
            color="textPrimary"
            variant="h2"
            align="center"
          >
            {selectedProduct ? 'Edit product' : 'Add new product'}
          </Typography>
          <IconButton aria-label="close" className={classes.closeIcon} onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          error={Boolean(formik.touched.name && formik.errors.name)}
          fullWidth
          helperText={formik.touched.name && formik.errors.name}
          label="Name"
          margin="normal"
          name="name"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.name}
        />
        <TextField
          error={Boolean(formik.touched.hourPrice && formik.errors.hourPrice)}
          fullWidth
          helperText={formik.touched.hourPrice && formik.errors.hourPrice}
          label="Price"
          margin="normal"
          name="hourPrice"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="number"
          value={formik.values.hourPrice}
        />
        <TextField
          error={Boolean(formik.touched.imageUrl && formik.errors.imageUrl)}
          fullWidth
          helperText={formik.touched.imageUrl && formik.errors.imageUrl}
          label="Image"
          margin="normal"
          name="imageUrl"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.imageUrl}
        />
        <FormControl fullWidth>
          <InputLabel id="Input label">Accounts</InputLabel>
          <Select
            labelId="Input label"
            id="Select"
            error={Boolean(formik.touched.accountId && formik.errors.accountId)}
            fullWidth
            helpertext={formik.touched.accountId && formik.errors.accountId}
            onBlur={formik.handleBlur('accountId')}
            onChange={formik.handleChange('accountId')}
            value={formik.values.accountId}
          >
            {
            accounts && accounts.map((company) => {
              return (
                <MenuItem
                  value={company.id}
                  key={company.id}
                >
                  {company.companyName}
                </MenuItem>
              );
            })

            }
          </Select>
        </FormControl>
        <Box
          alignItems="center"
          display="flex"
          ml={-1}
        >
          <Switch
            checked={formik.values.status}
            name="status"
            onChange={formik.handleChange}
          />
          <Typography
            color="textSecondary"
          >
            Active
          </Typography>
        </Box>
        <Box my={2}>
          <Button
            color="primary"
            disabled={formik.isSubmitting}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
          >
            {selectedProduct ? 'Save' : 'Add product'}
          </Button>
        </Box>
      </form>
    </Card>
  </Dialog>
);
};

ProductsForm.propTypes = {
  showModal: PropTypes.bool.isRequired,
  selectedProduct: PropTypes.object,
  closeModal: PropTypes.func,
  accounts: PropTypes.array,
  getAccountByName: PropTypes.func,
  getRoleByUsersId: PropTypes.func
};

export default ProductsForm;
