import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import FirebaseAuthService from 'services/firebaseAuthService';
import { setOrganization } from 'redux/ducks/user.duck';
import { Card } from 'components/Cards/Card.jsx';
import { FormInputs } from 'components/FormInputs/FormInputs.jsx';
import Button from 'components/Buttons/CustomButton.jsx';
import bg from 'assets/img/blur-classroom.png';

function Login({
  history, setOrganizationStore, clearStore,
}) {
  const [formData, setFormData] = useState({});
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    console.log('ressetting app');
    clearStore(); // reset on logout to avoid stale data between users
  }, []);

  function onLogin(username, password) {
    FirebaseAuthService.signInUser({ username, password })
      .then(() => {
        console.log('login success');
        history.push('/admin/console');
      }).catch((err) => {
        setErrorText('Login failed. Is something misspelled?');
        console.error('fb login error', err, { username, password });
      });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log(formData);
    if (!formData.org
      || !formData.email
      || !formData.password)
      setErrorText('Looks like a field is empty. Please try again');
    else
      onLogin(formData.email, formData.password);
  }

  function handleChange(e, name) {
    setErrorText('');
    setFormData({
      ...formData,
      [name]: e.target.value,
    });
    if (name === 'org')
      setOrganizationStore(e.target.value);
  }

  return (
    <div style={{
      height: '92vh',
      justifyContent: 'center',
      backgroundImage: `url(${bg})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    }}
    >
      <div style={{
        paddingTop: '40px',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '500px',
      }}
      >
        <Card
          title="Welcome to the Watutor Organization Management Console"
          content={(
            <form onSubmit={handleSubmit}>
              <FormInputs
                ncols={['col-xs-12', 'col-xs-12', 'col-xs-12']}
                handleChange={handleChange}
                properties={[
                  {
                    name: 'org',
                    label: 'Organization',
                    type: 'text',
                    bsClass: 'form-control',
                    placeholder: 'Company Name Here',
                  },
                  {
                    name: 'email',
                    label: 'Email Username',
                    type: 'text',
                    bsClass: 'form-control',
                    placeholder: 'Username',
                  },
                  {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    bsClass: 'form-control',
                    placeholder: 'Username',
                  },
                ]}
              />

              <Button bsStyle="primary" pullRight fill type="submit">
                Login
                {' '}
                <i className="pe-7s-lock" />
              </Button>
              <div style={{ padding: '10px' }}>
                <span className="text-danger">
                  {errorText}
                </span>
              </div>
              <div className="clearfix" />
            </form>
          )}
        />
      </div>
    </div>
  );
}

const mapDispatchToProps = {
  setOrganizationStore: setOrganization,
  clearStore: () => ({ type: 'RESET_APP' }),
};

export default connect(null, mapDispatchToProps)(Login);
