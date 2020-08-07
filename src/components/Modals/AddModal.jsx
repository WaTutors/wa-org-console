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

AddModal.propTypes = {
  header: PropTypes.string.isRequired,
  form: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  infoText: PropTypes.string,
  onSubmit: PropTypes.func,
  processFile: PropTypes.func,
  hideFile: PropTypes.bool,
};

AddModal.defaultProps = {
  infoText: '',
  onSubmit: (e) => console.log('form submitted', e),
  hideFile: false,
  processFile: (raw) => ({ phone: raw.split(',') }),
};

const BODY_TYPES = { form: 'form', file: 'file' };

function AddModal({
  header,
  infoText,
  form,
  onSubmit,
  isOpen,
  toggleOpen,
  hideFile,
  processFile,
}) {
  const [bodySelected, setBody] = useState(hideFile ? BODY_TYPES.form : BODY_TYPES.file);
  const [inputData, setInputData] = useState({});

  function handleFileDrop(rawData) { // rawData is uint8 encoded
    console.log('addModal raw data', rawData);
    setInputData(processFile(rawData));
  }

  function handleConfirm(e) {
    console.log('AddModal confirm', inputData);
    onSubmit(inputData); // {phone: [phoneNumber]}
    setTimeout(() => {
      toggleOpen();
    }, 100);
  }

  function handleFormChange(e, name) {
    setInputData({ ...inputData, [name]: [e.target.value] });
    console.log('AddModal form change', name, e.target.value);
  }

  const buttonGroups = hideFile
    ? [[{
      text: 'Form',
      onClick: () => setBody(BODY_TYPES.form),
      icon: 'pe-7s-note2',
    }]]
    : [[{
      text: 'Form',
      onClick: () => setBody(BODY_TYPES.form),
      icon: 'pe-7s-note2',
    }, {
      text: 'File Upload',
      onClick: () => setBody(BODY_TYPES.file),
      icon: 'pe-7s-copy-file',
    }]];

  return (
    <Modal show={isOpen} onHide={toggleOpen}>
      <Modal.Header closeButton>
        {header}
      </Modal.Header>
      <Modal.Body>
        <div>
          <ButtonBar
            universalOptions={{ color: 'info' }}
            buttonGroups={buttonGroups}
          />
          <p>{infoText}</p>
          {bodySelected === BODY_TYPES.form
              && (
              <FormInputs
                ncols={form.map(() => 'col-xs-12')}
                handleChange={handleFormChange}
                properties={form}
              />
              )}
          {bodySelected === BODY_TYPES.file
          && (
          <FileDropzone
            targetText="Upload formatted CSV file"
            acceptTypes=".csv, application/vnd.ms-excel, text/csv"
            onFileDrop={handleFileDrop}
          />
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="primary" onClick={handleConfirm}>Continue</Button>
        {' '}
        <Button color="secondary" onClick={toggleOpen}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddModal;
