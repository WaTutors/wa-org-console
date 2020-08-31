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
import { connect } from 'react-redux';

import FirebaseAuthService from 'services/firebaseAuthService';
import { setOrganization } from 'redux/ducks/user.duck';
import { Card } from 'components/Cards/Card.jsx';
import { FormInputs } from 'components/FormInputs/FormInputs.jsx';
import Button from 'components/Buttons/CustomButton.jsx';
import bg from 'assets/img/blur-classroom.png';

const BACKGROUND_LINK = 'https://firebasestorage.googleapis.com/v0/b/watutors-1.appspot.com/o/public%2Fassets%2Fblur-classroom-min%20(1).png?alt=media&token=42fe721a-2d9a-4f70-9310-2205fc15590e';

function Login({
  history, setOrganizationStore,
}) {
  const [formData, setFormData] = useState({});
  const [errorText, setErrorText] = useState('');

  function onLogin(username, password) {
    FirebaseAuthService.signInUser({ username, password })
      .then(() => {
        history.push('/admin/console');
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
            <div>
              {/* LD-- form "enter" to submit accessability */}
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
                {' '}
                <i className="pe-7s-lock" />
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

const mapDispatchToProps = {
  setOrganizationStore: setOrganization,
};

export default connect(null, mapDispatchToProps)(Login);
