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
  exampleFilePath: PropTypes.oneOf(PropTypes.string, PropTypes.bool),
  onChangeSetFieldInvisibility: PropTypes.func,
};

AddModal.defaultProps = {
  infoText: '',
  onSubmit: (e) => console.log('form submitted', e),
  hideFile: false,
  processFile: (raw) => ({ phone: raw.split(',') }),
  exampleFilePath: false,
  onChangeSetFieldInvisibility: () => [],
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
  exampleFilePath,
  onChangeSetFieldInvisibility,
}) {
  const [bodySelected, setBody] = useState(hideFile ? BODY_TYPES.form : BODY_TYPES.file);
  const [inputData, setInputData] = useState({});
  const [invisibleFieldNames, setInvisibleFieldNames] = useState(onChangeSetFieldInvisibility({}));

  function handleFileDrop(rawData) { // rawData is uint8 encoded
    console.log('addModal raw data', rawData);
    setInputData(processFile(rawData));
  }

  function close() {
    setInputData({}); // reset data
    setTimeout(() => {
      toggleOpen(false);
    }, 100);
  }

  function handleConfirm(e) {
    console.log('AddModal confirm', { inputData });
     // {phone: [phoneNumber]}
    onSubmit(inputData).then(result =>{
      //currently returns undefined if no errors
      if(result !== false){
        close()
      }
    }).catch(err => {
      close()
    })
    // close();
  }

  function handleFormChange(e, name) {
    console.log('AddModal form change', { name, value: e.target.value });
    const newInputData = { ...inputData, [name]: e.target.value };
    setInputData(newInputData);
    // conditiionally hide fields
    setInvisibleFieldNames(
      onChangeSetFieldInvisibility(newInputData),
    );
  }

  const buttonGroups = hideFile // if hideFile == true only show Form option
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
    <Modal show={isOpen} onHide={close}>
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
                invisibleFieldNames={invisibleFieldNames}
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
        {exampleFilePath
        && (
        <Button
          color="success"
          style={{ float: 'left' }}
          href={exampleFilePath}
        >
          Example File
        </Button>
        )}
        <Button color="primary" onClick={handleConfirm}>Continue</Button>
        {' '}
        <Button color="secondary" onClick={close}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddModal;
