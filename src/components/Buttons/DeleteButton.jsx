import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import cx from 'classnames';
import PropTypes from 'prop-types';

function DeleteButton() {
  return (
    <div style={{
      fontSize: '32px',
      color: 'white',
      background: 'red',
      borderRadius: '100%',
      justifyContent: 'center',
      textAlign: 'center',
      maxWidth: '40px',
    }}
    >
      <i className="pe-7s-delete-user" />
    </div>
  );
}

export default DeleteButton;
