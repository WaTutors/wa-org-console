/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import {
  Button, Label, Input,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

import ButtonBar from 'components/Buttons/ButtonBar';
import FileDropzone from 'components/FormInputs/FileDropzone';
import FormInputs from 'components/FormInputs/FormInputs';

EditModal.propTypes = {
  header: PropTypes.string.isRequired,
  form: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  infoText: PropTypes.string,
  onSubmit: PropTypes.func,
};

EditModal.defaultProps = {
  infoText: '',
  onSubmit: (e) => console.log('form submitted', e),
};

function EditModal({
  header,
  infoText,
  onSubmit,
  isOpen,
  toggleOpen,
  form,
}) {
  const [inputData, setInputData] = useState({});

  function close() {
    setInputData({}); // reset data
    setTimeout(() => {
      toggleOpen(false);
    }, 100);
  }

  function handleConfirm() {
    console.log('EditModal confirm', inputData);
    onSubmit(inputData); // {phone: [phoneNumber]}
    close();
  }

  function handleFormChange(e, name) {
    console.log('EditModal form change', { name, value: e.target.value });
    const newInputData = { ...inputData, [name]: e.target.value };
    setInputData(newInputData);
  }

  return (
    <Modal show={isOpen} onHide={close}>
      <Modal.Header closeButton>
        {header}
      </Modal.Header>
      <Modal.Body>
        <div>
          <p>{infoText}</p>
          <FormInputs
            ncols={form.map(() => 'col-xs-12')}
            handleChange={handleFormChange}
            properties={form}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="primary" onClick={handleConfirm}>Continue</Button>
        {' '}
        <Button color="secondary" onClick={close}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditModal;
