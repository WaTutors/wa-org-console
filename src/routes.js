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
import UserProfile from 'views/UserProfile.jsx';
import TableList from 'views/TableList.jsx';
import {
  GroupList, ProviderList, StudentList, SessionList,
} from 'views/Tables';

import Typography from 'views/Typography.jsx';
import Icons from 'views/Icons.jsx';
import Maps from 'views/Maps.jsx';
import Notifications from 'views/Notifications.jsx';
import Upgrade from 'views/Upgrade.jsx';

import Login from 'views/Login.jsx';

const dashboardRoutes = [
  {
    live: true,
    path: '/console',
    name: 'Console',
    icon: 'pe-7s-graph',
    component: Dashboard,
    layout: '/admin',
  },
  {
    live: true,
    path: '/students',
    name: 'Student List',
    icon: 'pe-7s-users',
    component: StudentList,
    layout: '/admin',
  },
  {
    live: true,
    path: '/providers',
    name: 'Instructor List',
    icon: 'pe-7s-note2',
    component: ProviderList,
    layout: '/admin',
  },
  {
    live: true,
    path: '/groups',
    name: 'Group List',
    icon: 'pe-7s-vector',
    component: GroupList,
    layout: '/admin',
  },
  {
    live: true,
    path: '/sessions',
    name: 'Session List',
    icon: 'pe-7s-video',
    component: SessionList,
    layout: '/admin',
  },
  {
    live: false,
    external: true,
    icon: 'pe-7s-piggy',
    name: 'Invoices',
    link: 'https://www.watutors.com',
  },
  {
    path: '/dashboard',
    name: 'PREBUILT PAGES BELOW vvv',
    icon: 'pe-7s-angle-down',
    component: Dashboard,
    layout: '/admin',
  },
  {
    path: '/user',
    name: 'User Profile',
    icon: 'pe-7s-user',
    component: UserProfile,
    layout: '/admin',
  },
  {
    path: '/table',
    name: 'Table List',
    icon: 'pe-7s-note2',
    component: TableList,
    layout: '/admin',
  },
  {
    path: '/typography',
    name: 'Typography',
    icon: 'pe-7s-news-paper',
    component: Typography,
    layout: '/admin',
  },
  {
    path: '/icons',
    name: 'Icons',
    icon: 'pe-7s-science',
    component: Icons,
    layout: '/admin',
  },
  {
    path: '/maps',
    name: 'Maps',
    icon: 'pe-7s-map-marker',
    component: Maps,
    layout: '/admin',
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: 'pe-7s-bell',
    component: Notifications,
    layout: '/admin',
  },
  {
    live: true,
    upgrade: true,
    path: '/login',
    name: 'Sign Out',
    icon: 'pe-7s-back-2',
    component: Login,
    layout: '/ext',
  },
];

export default dashboardRoutes;
