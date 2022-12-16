import React from 'react';
import firebase from 'firebase/app';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import {
  Box, Card, IconButton, makeStyles, Typography
} from '@material-ui/core';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import { useFirestore, getFirebase } from 'react-redux-firebase';
import GrandPermition from '../../../utils/GrandPermission';
/* import generatePinCode from '../../../utils/generatePinCode'; */
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

const CustomersForm = ({
  showModal,
  selectedCustomer,
  closeModal,
  accounts, getAccountByName, getRoleByUsersId
}) => {
  const classes = useStyles();
  const firestore = useFirestore();
  const firebaseG = getFirebase();
  const usersId = firebaseG.auth().currentUser.uid;
  const accIdFromRedux = getRoleByUsersId(usersId).usersAccountId;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: selectedCustomer ? selectedCustomer.firstName : '',
      lastName: selectedCustomer ? selectedCustomer.lastName : '',
      email: selectedCustomer ? selectedCustomer.email : '',
      accountId: accIdFromRedux,
      phoneNumber: selectedCustomer ? selectedCustomer.phoneNumber : '',

    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string().min(1).required('Please write your first name'),
      lastName: Yup.string().min(1).required('please write your last name'),
      email: Yup.string().min(4).required('Please write your email'),
      phoneNumber: Yup.string().required('please write your phone number'),
      accountId: Yup.string().required('please select company name'),
    }),

    onSubmit: async (values, { resetForm }) => {
      values = {
        ...values,
        updated: firestore.FieldValue.serverTimestamp()
      };
      if (selectedCustomer !== null) {
        try {
          // Update customer
          const JWTToken = await firebase.auth().currentUser.getIdToken();
          const response = await axios.patch(`/adm/customer/${selectedCustomer.id}`, values, {
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
        } catch (error) {
          formik.setSubmitting(false);
            let { message: errorMessage } = error;
            if (errorMessage === null || errorMessage === '') {
              errorMessage = 'Something went wrong. Please try again later.';
            }
            console.log(errorMessage);
        }
      } else {
        values = {
           ...values,
       created: firestore.FieldValue.serverTimestamp(),
       updated: firestore.FieldValue.serverTimestamp(),
       };
        try {
         // Create new customer
         const JWTToken = await firebase.auth().currentUser.getIdToken();
         const response = await axios.post('/adm/customer', values, {
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
        } catch (error) {
          formik.setSubmitting(false);
            let { message: errorMessage } = error;
            if (errorMessage === null || errorMessage === '') {
              errorMessage = 'Something went wrong. Please try again later.';
            }
            console.log(errorMessage);
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
              {selectedCustomer ? 'Edit customer' : 'Add new customer'}
            </Typography>
            <IconButton aria-label="close" className={classes.closeIcon} onClick={closeModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextField
            error={Boolean(formik.touched.firstName && formik.errors.firstName)}
            fullWidth
            helperText={formik.touched.firstName && formik.errors.firstName}
            label="First name"
            margin="normal"
            name="firstName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="text"
            value={formik.values.firstName}
          />
          <TextField
            error={Boolean(formik.touched.lastName && formik.errors.lastName)}
            fullWidth
            helperText={formik.touched.lastName && formik.errors.lastName}
            label="Last name"
            margin="normal"
            name="lastName"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="text"
            value={formik.values.lastName}
          />
          <TextField
            error={Boolean(formik.touched.email && formik.errors.email)}
            fullWidth
            helperText={formik.touched.email && formik.errors.email}
            label="Email"
            margin="normal"
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="text"
            value={formik.values.email}
          />
          <TextField
            error={Boolean(formik.touched.phoneNumber && formik.errors.phoneNumber)}
            fullWidth
            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
            label="Phone number"
            margin="normal"
            name="phoneNumber"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="text"
            value={formik.values.phoneNumber}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="Account"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            margin="normal"
            type="text"
            name="companyName"
            value={getAccountByName(accIdFromRedux)}
          />
          <Box my={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              color="primary"
              disabled={formik.isSubmitting}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              {selectedCustomer ? 'Save' : 'Add customer'}
            </Button>

          </Box>
        </form>
      </Card>
    </Dialog>
  );
}
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
            {selectedCustomer ? 'Edit customer' : 'Add new customer'}
          </Typography>
          <IconButton aria-label="close" className={classes.closeIcon} onClick={closeModal}>
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          error={Boolean(formik.touched.firstName && formik.errors.firstName)}
          fullWidth
          helperText={formik.touched.firstName && formik.errors.firstName}
          label="First name"
          margin="normal"
          name="firstName"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.firstName}
        />
        <TextField
          error={Boolean(formik.touched.lastName && formik.errors.lastName)}
          fullWidth
          helperText={formik.touched.lastName && formik.errors.lastName}
          label="Last name"
          margin="normal"
          name="lastName"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.lastName}
        />
        <TextField
          error={Boolean(formik.touched.email && formik.errors.email)}
          fullWidth
          helperText={formik.touched.email && formik.errors.email}
          label="Email"
          margin="normal"
          name="email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.email}
        />
        <TextField
          error={Boolean(formik.touched.phoneNumber && formik.errors.phoneNumber)}
          fullWidth
          helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
          label="Phone number"
          margin="normal"
          name="phoneNumber"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="text"
          value={formik.values.phoneNumber}
        />
        <FormControl fullWidth>
          <InputLabel id="Input label">Account</InputLabel>
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
        <Box my={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            color="primary"
            disabled={formik.isSubmitting}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
          >
            {selectedCustomer ? 'Save' : 'Add customer'}
          </Button>

        </Box>
      </form>
    </Card>
  </Dialog>
);
};

CustomersForm.propTypes = {
  showModal: PropTypes.bool.isRequired,
  selectedCustomer: PropTypes.object,
  closeModal: PropTypes.func,
  accounts: PropTypes.array,
  getAccountByName: PropTypes.func,
  getRoleByUsersId: PropTypes.func
};

export default CustomersForm;
