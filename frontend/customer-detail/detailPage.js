import React/* , { useState } */ from 'react';
import {
  makeStyles,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from '@material-ui/core';
import { useParams } from 'react-router-dom';

import PropTypes from 'prop-types';

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
        height: '22vh',
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'column',
        // justifyContent: 'flex-start',
    },
    back: {
        width: 100,
        height: 50,
        marginRight: 100
    },
    edit: {
        height: 36,
        width: 100,
        alignSelf: 'center'
    },
    grey: {
      backgroundColor: '#7C7C7C',
    },
    border: {
      // width: '1',
      border: '1px solid #000000',
      textAlign: 'center',
      // borderBottom: '1px solid #000000',
    }
}));

const DetailPage = ({
  getCustomerByName,
  getCustomerByLastName,
  getCustomerByNumber,
  getCustomerByEmail }) => {
  const classes = useStyles();

  const { customerId } = useParams();

  const customerID = JSON.stringify(customerId);

return (
  <Card>
    <Box
      m={2}
    >
      <Box
        className={classes.customerDetails}
      >
        <Typography
          clone
          style={{ marginBottom: '5px', fontWeight: 'bold' }}
        >
          Customer Number: 13337777
        </Typography>
        <Typography
          clone
          style={{ marginBottom: '5px', fontWeight: 'bold' }}
        >
          {
          `Name:
                ${getCustomerByName(`${JSON.parse(customerID)}`)}
                ${getCustomerByLastName(`${JSON.parse(customerID)}`)}
          `
          }
        </Typography>

        <Typography
          clone
          style={{ marginBottom: '5px', fontWeight: 'bold' }}
        >
          {
          `Email:
          ${getCustomerByEmail(`${JSON.parse(customerID)}`)}
        `
        }
        </Typography>
        <Typography
          clone
          style={{ marginBottom: '5px', fontWeight: 'bold' }}
        >
          {
          `Phone:
                ${getCustomerByNumber(`${JSON.parse(customerID)}`)}
          `
          }
        </Typography>

        <Typography
          clone
          style={{ marginBottom: '5px', fontWeight: 'bold' }}
        >
          Adress: Example adress 12
        </Typography>
        <Typography
          clone
          style={{ marginBottom: '5px', fontWeight: 'bold' }}
        >
          City: Example city
        </Typography>
        <Typography
          clone
          style={{ marginBottom: '5px', fontWeight: 'bold' }}
        >
          Zip code: 371 30
        </Typography>
      </Box>
      <Box
        fontWeight="bold"
        fontSize="larger"
      >
        Order History:
      </Box>
      <TableContainer
        clone
        style={{ width: '60rem', fontWeight: 'bold' }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                className={classes.border}
                clone
                style={{ width: '10rem', fontWeight: 'bold' }}
              >
                Order num
              </TableCell>
              <TableCell
                className={classes.border}
                clone
                style={{ width: '10rem', fontWeight: 'bold' }}
              >
                Booking start date
              </TableCell>
              <TableCell
                className={classes.border}
                clone
                style={{ width: '10rem', fontWeight: 'bold' }}
              >
                Booking end date
              </TableCell>
              <TableCell
                className={classes.border}
                clone
                style={{ width: '10rem', fontWeight: 'bold' }}
              >
                Channel
              </TableCell>
              <TableCell
                className={classes.border}
                clone
                style={{ width: '10rem', fontWeight: 'bold' }}
              >
                Payment
              </TableCell>
              <TableCell
                className={classes.border}
                clone
                style={{ width: '10rem', fontWeight: 'bold' }}
              >
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className={classes.border}>
                10001
              </TableCell>
              <TableCell className={classes.border}>
                2021-08-22 10.00
              </TableCell>
              <TableCell className={classes.border}>
                2021-08-22 15.00
              </TableCell>
              <TableCell className={classes.border}>
                GL AB
              </TableCell>
              <TableCell
                className={classes.border}
                clone
                style={{ backgroundColor: '#94FF7E' }}
              >
                swish
              </TableCell>
              <TableCell className={classes.border}>
                750:-
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={classes.border}>
                10002
              </TableCell>
              <TableCell className={classes.border}>
                2021-09-12 12.00
              </TableCell>
              <TableCell className={classes.border}>
                2021-09-12 15.00
              </TableCell>
              <TableCell className={classes.border}>
                Manual
              </TableCell>
              <TableCell
                className={classes.border}
                clone
                style={{ backgroundColor: '#F6FF7E' }}
              >
                manual invoice
              </TableCell>
              <TableCell className={classes.border}>
                880:-
              </TableCell>
            </TableRow>
          </TableBody>
          {/* <TableBody>

        </TableBody> */}
        </Table>
      </TableContainer>
    </Box>
  </Card>
  );
};
DetailPage.propTypes = {
  // data: PropTypes.array.isRequired,
//   onUpdateLocker: PropTypes.func,
  getCustomerByName: PropTypes.func,
  getCustomerByLastName: PropTypes.func,
  getCustomerByNumber: PropTypes.func,
  getCustomerByEmail: PropTypes.func,
//   getAccNameByProduct: PropTypes.func,
  // getStationByName: PropTypes.func,
};
export default DetailPage;
