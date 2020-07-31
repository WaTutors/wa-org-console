/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Dashboard from 'views/Dashboard.jsx';

import Login from 'views/Login.jsx';
import VerifyEmail from 'views/VerifyEmail';

const externalRoutes = [
  {
    path: '/login',
    name: 'Dashboard',
    icon: 'pe-7s-graph',
    component: Login,
    layout: '/ext',
  },
  {
    path: '/verify',
    name: 'Verify Email',
    icon: 'pe-7s-graph',
    component: VerifyEmail,
    layout: '/ext',
  },
  {
    path: '/404',
    name: 'Not Found',
    icon: 'pe-7s-search',
    component: Dashboard,
    layout: '/ext',
  },
];

export default externalRoutes;
