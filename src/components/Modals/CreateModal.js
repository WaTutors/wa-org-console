/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import {
  Button, Label, Input,
} from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';

import ButtonBar from 'components/Buttons/ButtonBar';
import FileDropzone from 'components/FormInputs/FileDropzone';
import FormInputs from 'components/FormInputs/FormInputs';
import { createOrgThunk } from 'redux/ducks/user.duck';

function CreateModal({
  onSubmit, isOpen, toggleOpen, error, createOrg,
}) {
  return (
    <Modal show={isOpen}>
      <Modal.Header closeButton style={{ fontWeight: '500' }}>
        Create Simulation
      </Modal.Header>
      <Modal.Body>
        <div>
          <p>Enter a new Org name:</p>
          <FormInputs
            ncols={['col-xs-12']}
            // handleChange={handleFormChange}
            properties={[
              {
                name: 'property',
                label: 'Org Name',
                type: 'text',
                bsClass: 'form-control',
                placeholder: 'watutor_default',
              },
            ]}
          />
          {error && error.message && <p style={{ color: 'red' }}>{error.message}</p>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="secondary" onClick={() => toggleOpen(false)}>Cancel</Button>
        {' '}
        <Button color="primary" onClick={() => createOrg('test')}>Create</Button>
      </Modal.Footer>
    </Modal>
  );
}

CreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

CreateModal.defaultProps = {
  onSubmit: (e) => console.log('form submitted', e),
};

const mapStateToProps = ({ userReducer }) => ({
  error: userReducer.error,
});

const mapDispatchToProps = (dispatch) => ({
  createOrg: (name) => dispatch(createOrgThunk(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateModal);
