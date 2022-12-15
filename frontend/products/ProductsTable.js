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
import GrandPermition from '../../utils/GrandPermission';

const ProductsTable = ({
  data, searchTerm, onUpdateProduct, getRoleByUsersId, onAskToDeleteProduct, getAccountByName
}) => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
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
              <TableCell>
                Product Image
              </TableCell>
              <TableCell>
                Name
              </TableCell>

              <TableCell>
                Price
              </TableCell>
              <TableCell>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.filter((val) => {
               if (searchTerm === '') {
                return val;
              } if (val.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return val;
              }
            }).slice(0, limit).map((product) => {
              return (
                <TableRow
                  hover
                  key={product.id}
                >

                  <TableCell>
                    <img src={product.imageUrl} style={{ width: '10rem', height: '6.25rem' }} alt="ProductImage" />
                  </TableCell>
                  <TableCell>
                    {product.name}
                  </TableCell>

                  <TableCell>
                    {product.hourPrice}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => onUpdateProduct(e, product)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={(e) => onAskToDeleteProduct(e, product)}>
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
// if usern är ADMIN_USER
return (
  <Card>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Product Image
            </TableCell>
            <TableCell>
              Company name
            </TableCell>
            <TableCell>
              Name
            </TableCell>

            <TableCell>
              Price
            </TableCell>
            <TableCell>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.filter((val) => {
             if (searchTerm === '') {
              return val;
            } if (val.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              return val;
            }
          }).slice(0, limit).map((product) => {
            return (
              <TableRow
                hover
                key={product.id}
              >
                <TableCell>
                  <img src={product.imageUrl} style={{ width: '10rem', height: '6.25rem' }} alt="ProductImage" />
                </TableCell>
                <TableCell>
                  {getAccountByName(product.accountId)}
                </TableCell>
                <TableCell>
                  {product.name}
                </TableCell>

                <TableCell>
                  {product.hourPrice}
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => onUpdateProduct(e, product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => onAskToDeleteProduct(e, product)}>
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

ProductsTable.propTypes = {
  data: PropTypes.array.isRequired,
  searchTerm: PropTypes.string,
  onUpdateProduct: PropTypes.func,
  onAskToDeleteProduct: PropTypes.func,
  getAccountByName: PropTypes.func,
  getRoleByUsersId: PropTypes.func
};

export default ProductsTable;
