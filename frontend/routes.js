/* eslint-disable max-len */
import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout/NavBar';

import DashboardView from 'src/views/dashboard';
import CustomersView from 'src/views/customers';
import StationsView from 'src/views/stations';

import UsersView from 'src/views/users';
import SiteView from 'src/views/sites';
import AuthLayout from 'src/layouts/AuthLayout';
import LoginView from 'src/views/auth/Login';
import RegisterView from 'src/views/auth/Register';
import NotFoundView from 'src/views/errors/NotFoundView';
import AccountView from './views/accounts';
import ProductView from './views/products';
import ExtraProductsView from './views/extra_products';
import ContractProductsView from './views/contract_products';
import StationDetailView from './views/station-detail';
import CheckoutProductsView from './views/checkout-products';
import ProfileView from './views/profile-page';
import CustomerDetailView from './views/customer-detail';
import PromoCodesView from './views/promo-codes';
import PrivateRoute from './utils/PrivateRoute';

export const routes = [
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <DashboardView /> },
      { path: 'customers', element: <PrivateRoute component={CustomersView} type={['BASIC_ACCOUNT']} /> },
      { path: 'customer-detail/:customerId', element: <CustomerDetailView /> },
      { path: 'stations', element: <PrivateRoute component={StationsView} type={['BASIC_ACCOUNT']} /> },
      { path: 'station-detail/:stationId', element: <PrivateRoute component={StationDetailView} type={['BASIC_ACCOUNT']} /> },
      { path: 'users', element: <PrivateRoute component={UsersView} type={['BASIC_ACCOUNT']} /> },
      { path: 'sites', element: <PrivateRoute component={SiteView} type={['BASIC_ACCOUNT']} /> },
      { path: 'accounts', element: <PrivateRoute component={AccountView} type={['BASIC_ACCOUNT']} /> },
      { path: 'products', element: <PrivateRoute component={ProductView} type={['BASIC_ACCOUNT']} /> },
      { path: 'profile-page', element: <ProfileView /> },
      { path: 'promo-codes', element: <PrivateRoute component={PromoCodesView} type={['BASIC_ACCOUNT']} /> },
      { path: 'checkout-products', element: <PrivateRoute component={CheckoutProductsView} type={['BASIC_ACCOUNT']} /> },
      { path: 'contract-products', element: <PrivateRoute component={ContractProductsView} type={['BASIC_ACCOUNT']} /> },
      { path: 'extra-products', element: <PrivateRoute component={ExtraProductsView} type={['BASIC_ACCOUNT']} /> },
      { path: '404', element: <NotFoundView /> },
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginView /> },
      { path: 'register', element: <RegisterView /> },
      { path: '*', element: <Navigate to="/404" /> }
    ]
  }
];

export default routes;
