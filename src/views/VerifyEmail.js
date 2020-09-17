/**
 * a user will be redirected to this page if their email hasn't been validated
 */

import React, { useEffect, useState, useRef } from 'react';
import { withRouter } from 'react-router-dom';

import { Button, Card, CardBody } from 'reactstrap';
import FirebaseAuthService from 'services/firebaseAuthService';

/** custom hook for intervals
 * @link https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function EmailValid({ history }) {
  const [delay, setDelay] = useState(4000);

  useEffect(() => { // logs google analytics screen
    FirebaseAuthService.setScreen('EmailVerification', '/email-verification');
  }, []);

  async function checkIfVerified() {
    const user = await FirebaseAuthService.getUserReload(); // force reload
    FirebaseAuthService.logEvent('click', { button: 'email_verification_check_passed' });

    console.log('EmailValid check', user);
    if (user) { // && user.emailVerified) {
      history.push('/profile');
      return true;
    }
    return false;
  }

  function onFocus() {
    checkIfVerified();
  }

  useEffect(() => {
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  function onRefreshButton() {
    FirebaseAuthService.logEvent('click', { button: 'refresh_check_email_verification' });
    checkIfVerified();
  }

  /*
  useInterval(() => { // poll database every second, w/ dropoff
    const isVerified = checkIfVerified();

    if (!isVerified) setDelay(delay < 6000 ? delay + 100 : null); // break after 10 tries (~3 mis)
  }, delay);
  */

  function onSendEmailVerification() {
    FirebaseAuthService.logEvent('click', { button: 'resend_email_verification' });
    FirebaseAuthService.sendEmailVerification();
  }

  return (
    <div className="app flex-row align-items-center justify-content-center">
      <Card className="m-2 mb-1">
        <CardBody className="p-5">
          <h1>
            Verify Email
            {' '}
            <span className="label text-muted" onClick={onRefreshButton}>
              <i className="fa fa-refresh fa-xs float-right" />
            </span>
          </h1>
          <p className="text-muted mb-1 mt-4">An email should have been sent to your account.</p>
          <p className="text-muted my-1">In order to continue, please verify your email.</p>

          <Button
            className="mt-4"
            color="primary"
            block
            onClick={onSendEmailVerification}
          >
            Resend Verification Email
          </Button>
          <p className="text-muted">If you don't see an email, try resending.</p>

        </CardBody>
      </Card>
    </div>
  );
}

export default withRouter(EmailValid);
