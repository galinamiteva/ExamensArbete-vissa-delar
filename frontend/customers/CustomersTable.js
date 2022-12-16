/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
} from '@material-ui/core';
import React, { useState } from 'react';
import { getFirebase } from 'react-redux-firebase';
import PropTypes from 'prop-types';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { useNavigate } from 'react-router';
import GrandPermition from '../../utils/GrandPermission';

const CustomersTable = ({ data, searchTerm, onUpdateCustomer,
  onAskToDeleteCustomer, getAccountByName, getRoleByUsersId }) => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const navigate = useNavigate();
  const openCustomerDetail = (custom) => {
    navigate('/customer-detail');
    navigate(`/customer-detail/${custom.id}`);
  };
  const firebaseG = getFirebase();
  const usersId = firebaseG.auth().currentUser.uid;
  const role = getRoleByUsersId(usersId).usersRole;

  const grantPermitionResult = GrandPermition(role);

  // if user är ACCOUNT_USER
if (!grantPermitionResult) {
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>
                Id
              </TableCell> */}
              <TableCell>
                First name
              </TableCell>
              <TableCell>
                Last name
              </TableCell>
              <TableCell>
                Email
              </TableCell>
              <TableCell>
                Phone number
              </TableCell>
              <TableCell align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.filter((val) => {
              if (searchTerm === '') {
                return val;
              } if (val.firstName.toLowerCase().includes(searchTerm.toLowerCase())
                || val.lastName.toLowerCase().includes(searchTerm.toLowerCase())) {
                return val;
              }
            }).slice(0, limit).map((customer) => {
              return (
                <TableRow
                  hover
                  key={customer.id}
                  onClick={() => openCustomerDetail(customer)}

                >
                  {/*  <TableCell>
                    {customer.id}
                  </TableCell> */}
                  <TableCell>
                    {customer.firstName}
                  </TableCell>
                  <TableCell>
                    {customer.lastName}
                  </TableCell>
                  <TableCell>
                    {customer.email}
                  </TableCell>
                  <TableCell>
                    {customer.phoneNumber}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(e) => onUpdateCustomer(e, customer)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={(e) => onAskToDeleteCustomer(e, customer)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
      />
    </Card>
  );
}
return (
  <Card>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {/* <TableCell>
              Id
            </TableCell> */}
            <TableCell>
              First name
            </TableCell>
            <TableCell>
              Last name
            </TableCell>
            <TableCell>
              Company name
            </TableCell>
            <TableCell>
              Email
            </TableCell>
            <TableCell>
              Phone number
            </TableCell>
            <TableCell align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.filter((val) => {
            if (searchTerm === '') {
              return val;
            } if (val.firstName.toLowerCase().includes(searchTerm.toLowerCase())
              || val.lastName.toLowerCase().includes(searchTerm.toLowerCase())) {
              return val;
            }
          }).slice(0, limit).map((customer) => {
            return (
              <TableRow
                hover
                key={customer.id}
                onClick={() => openCustomerDetail(customer)}

              >
                {/*  <TableCell>
                  {customer.id}
                </TableCell> */}
                <TableCell>
                  {customer.firstName}
                </TableCell>
                <TableCell>
                  {customer.lastName}
                </TableCell>
                <TableCell>
                  {getAccountByName(customer.accountId)}
                </TableCell>
                <TableCell>
                  {customer.email}
                </TableCell>
                <TableCell>
                  {customer.phoneNumber}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={(e) => onUpdateCustomer(e, customer)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => onAskToDeleteCustomer(e, customer)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      component="div"
      count={data.length}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleLimitChange}
      page={page}
      rowsPerPage={limit}
    />
  </Card>
);
};

CustomersTable.propTypes = {
  data: PropTypes.array.isRequired,
  searchTerm: PropTypes.string,
  onUpdateCustomer: PropTypes.func,
  onAskToDeleteCustomer: PropTypes.func,
  getAccountByName: PropTypes.func,
  getRoleByUsersId: PropTypes.func
};

export { CustomersTable as default };
