import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import FirebaseAuthService from 'services/firebaseAuthService';

// eslint-disable-next-line no-use-before-define
PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
};

function PrivateRoute({
  component: Component,
  name, path, // from route
  ...rest
}) {
  const { initializing, user } = FirebaseAuthService.authHook();

  // on login change, fetch organization information
  useEffect(() => {
    if (user)
      // getOrganizationProfile(user);
      console.log('PrivateRoute user logged in', user);
  }, [user, initializing]);

  useEffect(() => { // sets google analytics screen
    console.log('PrivateRoute setScreen GA ', { name, path });
    FirebaseAuthService.setScreen(name, path);
  }, [name]);

  if (initializing)
    return (
      <div style={{ textAlign: 'center', width: '100%' }}>
        <p>Loading...</p>
      </div>
    );

  const render = (props) => (
    <Component
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      routeName={name}
      routePath={path}
    />
  );

  if (Boolean(user) && !user.emailVerified) {
    console.log('email verification redirect triggered');
    FirebaseAuthService.setScreen('Email Verification Redirect', '/email-verification');
    return <Redirect to="/email-verification" />;
  }

  if (Boolean(user) || process.env.REACT_APP_OFFLINE === 'true')
    return <Route render={render} />;

  return <Redirect to="/login" />;
}

export default PrivateRoute;
