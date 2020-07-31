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
import React, { useState } from 'react';

import FirebaseAuthService from 'services/firebaseAuthService';
import { Card } from 'components/Card/Card.jsx';
import { FormInputs } from 'components/FormInputs/FormInputs.jsx';
import Button from 'components/Buttons/CustomButton.jsx';

function Login({
  history,
}) {
  const [formData, setFormData] = useState({});
  const [errorText, setErrorText] = useState('');

  function onLogin(username, password) {
    FirebaseAuthService.signInUser({ username, password })
      .then(() => {
        history.push('/admin/dashboard');
      }).catch((err) => {
        window.alert('Login Failed');
        console.error('fb login error', err, { username, password });
      });
  }

  function handleSubmit() {
    console.log(formData);
    if (!formData.org
      || !formData.email
      || !formData.password)
      setErrorText('Looks like a field is empty... Please try again');
    else
      onLogin(formData.email, formData.password);
  }

  function handleChange(e, name) {
    setErrorText('');
    setFormData({
      ...formData,
      [name]: e.target.value,
    });
  }

  return (
    <div style={{ height: '88vh', justifyContent: 'center' }}>
      <div style={{
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: '500px',
      }}
      >
        <Card
          title="Sign Into Organization Console"
          content={(
            <div>
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

              <Button bsStyle="primary" pullRight fill onClick={handleSubmit}>
                Login
              </Button>
              <div style={{ padding: '10px' }}>
                <span className="text-danger">
                  {errorText}
                </span>
              </div>
              <div className="clearfix" />
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default Login;