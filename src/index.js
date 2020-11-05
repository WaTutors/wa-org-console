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
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {
  BrowserRouter, Route, Switch, Redirect,
} from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { ToastContainer } from 'react-toastify';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/animate.min.css';
import './assets/sass/light-bootstrap-dashboard-react.scss?v=1.3.0';
import './assets/css/demo.css';
import './assets/css/pe-icon-7-stroke.css';
import 'react-toastify/dist/ReactToastify.css';

import AdminLayout from 'layouts/Admin.jsx';
import External from 'layouts/External.jsx';
import store from './redux';

const SentryRoute = Sentry.withSentryRouting(Route);

const history = createBrowserHistory();

Sentry.init({
  dsn: 'https://5e51804b311644a98ed1beb82ce76216@o389415.ingest.sentry.io/5405269',
  release: 'wonsole@1.0.0',
  integrations: [new Integrations.BrowserTracing({
    routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
  })],
  tracesSampleRate: 1.0,
  normalizeDepth: 10,
});

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Switch>
        <SentryRoute path="/admin" render={(props) => <AdminLayout {...props} />} />
        <SentryRoute path="/ext" render={(props) => <External {...props} />} />
        <Redirect from="/" to="/ext/login" />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
