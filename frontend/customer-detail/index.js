import React, { useState, useEffect } from 'react';
import Page from 'src/components/Page';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
    Container,
    makeStyles, Box, Button, Typography,
} from '@material-ui/core';
import moment from 'moment';
import { useParams } from 'react-router-dom';
import axios from '../../lib/axios';
import DetailPage from './detailPage';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: theme.palette.background.dark,
        minHeight: '100%',
        paddingBottom: theme.spacing(3),
        paddingTop: theme.spacing(3)
    },
    customerName: {
        margin: '0 !important',
        fontSize: '18px'
    },
    customerDetails: {
        margin: '0 !important',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 100,
        width: '60%'
    },
    addNewButton: {
        height: 36,
        alignSelf: 'center'
    },
    back: {
        width: 150,
        height: 50,
        marginRight: 100,
        fontWeight: 'bold',
        fontSize: '1rem',
    },
    edit: {
        height: 30,
        width: 135,
        alignSelf: 'center',
        fontSize: '1rem',
        backgroundColor: 'blue',
    }
}));

const CustomerDetailView = () => {
    const { t } = useTranslation();
    const classes = useStyles();

    const [customers, setCustomers] = useState([]);
    // const [accounts, setAccounts] = useState([]);

    const { customerId } = useParams();

    const navigate = useNavigate();
    const customerID = JSON.stringify(customerId);

    async function downloadCustomers() {
        try {
          const response = await axios.get('/adm/customers_simple');
          const code = response.status;
          if (code >= 200 && code < 300) {
            setCustomers(response.data);
          }
        } catch (err) {
          console.error(err);
        }
      }
      useEffect(() => {
          downloadCustomers();
      }, []);

      const getCustomerByName = (customersId) => {
        let customerName = null;
        customers.forEach((value) => {
          if (customersId === value.id) {
            customerName = value.firstName;
            // console.log(customerId);
            // console.log(customerName);
        }
    });
    return customerName;
};
const getCustomerByNumber = (customersId) => {
  let customerNumber = null;
  customers.forEach((value) => {
    if (customersId === value.id) {
      customerNumber = value.phoneNumber;
  }
});
return customerNumber;
};

const getCustomerByCreated = (customersId) => {
  let created = null;
  customers.forEach((value) => {
    if (customersId === value.id) {
      created = value.created;
      // console.log(created);
    }
  });
  return created;
};
 getCustomerByCreated();
const getCustomerByEmail = (customersId) => {
  let email = null;
  customers.forEach((value) => {
    if (customersId === value.id) {
      email = value.email;
  }
});
return email;
};
      const getCustomerByLastName = (customersId) => {
        let customerName = null;
        customers.forEach((value) => {
          if (customersId === value.id) {
            customerName = value.lastName;
            // console.log(customerId);
            // console.log(customerName);
        }
    });
    return customerName;
};
    return (
      <Page
        className={classes.root}
        title={t('customer_detail')}
      >
        <Container maxWidth={false}>
          <div
            clone
            style={{ width: '70vw' }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="90%"
              m={2}
            //   mr
            >
              <Button
                className={classes.back}
                onClick={() => navigate('/customers')}
              >
                Go Back
              </Button>
              <Box
                width="100%"
              >
                <Typography
                  clone
                  style={{ fontWeight: 'bold', fontSize: '1.2em' }}
                >
                  {
                  `Customer:
                  ${getCustomerByName(`${JSON.parse(customerID)}`)}
                  ${getCustomerByLastName(`${JSON.parse(customerID)}`)}
                  `
                }
                </Typography>
                <Typography>

                  {
                `Created:
                ${moment(customers.created).format('DD/MM/YYYY HH:mm')}
                `
                }

                </Typography>
              </Box>
              <Button
                color="primary"
                variant="contained"
                className={classes.edit}
                //   onClick={edit}
              >
                Edit
              </Button>
            </Box>
          </div>
          <DetailPage
            data={customers}
            // onUpdateLocker={onUpdateLocker}
            getCustomerByName={getCustomerByName}
            getCustomerByLastName={getCustomerByLastName}
            getCustomerByNumber={getCustomerByNumber}
            getCustomerByEmail={getCustomerByEmail}
            // getProductByName={getProductByName}
            // getAccNameByProduct={getAccNameByProduct}
          />
        </Container>
      </Page>
    );
};
export default CustomerDetailView;
