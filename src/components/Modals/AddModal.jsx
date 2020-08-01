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
  infoText: PropTypes.string,
  form: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  onSubmit: PropTypes.func,
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
};

AddModal.defaultProps = {
  infoText: '',
  onSubmit: (e) => console.log('form submitted', e),
};

const BODY_TYPES = { form: 'form', file: 'file' };

function AddModal({
  header,
  infoText,
  form,
  onSubmit,
  isOpen,
  toggleOpen,
}) {
  const [bodySelected, setBody] = useState(BODY_TYPES.file);

  console.log({ isOpen });

  const handleConfirm = (e) => {
    console.log('AddModal confirm', e);
    onSubmit();
  };

  function handleFormChange(e, name) {
    console.log('AddModal form change', name, e);
  }

  return (
    <Modal show={isOpen} onHide={toggleOpen}>
      <Modal.Header closeButton>
        {header}
      </Modal.Header>
      <Modal.Body>
        <div>
          <ButtonBar
            universalOptions={{ color: 'info' }}
            buttonGroups={[[{
              text: 'Form',
              onClick: () => setBody(BODY_TYPES.form),
              icon: 'pe-7s-note2',
            }, {
              text: 'File Upload',
              onClick: () => setBody(BODY_TYPES.file),
              icon: 'pe-7s-copy-file',
            }]]}
          />
          <p>{infoText}</p>
          {bodySelected === BODY_TYPES.form
              && (
              <FormInputs
                ncols={['col-xs-12']}
                handleChange={handleFormChange}
                properties={form}
              />
              )}
          {bodySelected === BODY_TYPES.file
          && (
          <FileDropzone
            targetText="Upload formatted CSV file"
            acceptTypes=".csv, application/vnd.ms-excel, text/csv"
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
