/* eslint-disable no-use-before-define */
import React, { useState } from 'react';
import { Button } from 'reactstrap';
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
  downloadName: PropTypes.string,
  hideFile: PropTypes.bool,
  exampleFilePath: PropTypes.oneOf(PropTypes.string, PropTypes.bool),
  onChangeSetFieldInvisibility: PropTypes.func,
  children: PropTypes.node,
  passInputData: PropTypes.func,
};

AddModal.defaultProps = {
  infoText: '',
  onSubmit: (e) => {
    console.log('form submitted', e);
    return Promise.resolve(false);
  },
  hideFile: false,
  processFile: (raw) => ({ phone: raw.split(',') }),
  exampleFilePath: false,
  onChangeSetFieldInvisibility: () => [],
  children: null,
  passInputData: null,
  downloadName: 'template.csv',
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
  downloadName,
  exampleFilePath,
  onChangeSetFieldInvisibility,
  children,
  passInputData,
}) {
  const [bodySelected, setBody] = useState(BODY_TYPES.form); // if `hideFile` cannot be file
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
    onSubmit(inputData).then((result) => {
      // currently returns undefined if no errors
      if (result !== false)
        close();
    }).catch((err) => {
      close();
    });
  }

  function handleFormChange(e, name) {
    console.log('AddModal form change', { name, value: e.target.value });
    const newInputData = { ...inputData, [name]: e.target.value };
    setInputData(newInputData);

    if (passInputData)
      passInputData(newInputData);
    // conditiionally hide fields
    setInvisibleFieldNames(
      onChangeSetFieldInvisibility(newInputData),
    );
  }

  const buttonGroups = hideFile // if hideFile == true only show Form option
    ? [[{
      text: 'Form',
      onClick: () => setBody(BODY_TYPES.form),
      field: BODY_TYPES.form,
      icon: 'pe-7s-note2',
    }]]
    : [[{
      text: 'Form',
      onClick: () => setBody(BODY_TYPES.form),
      field: BODY_TYPES.form,
      icon: 'pe-7s-note2',
    }, {
      text: 'File Upload',
      onClick: () => setBody(BODY_TYPES.file),
      icon: 'pe-7s-copy-file',
      field: BODY_TYPES.file,
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
            selectedField={bodySelected}
          />
          <p>{infoText}</p>
          {bodySelected === BODY_TYPES.form
              && (
                <>
                  <FormInputs
                    ncols={form.map(() => 'col-xs-12')}
                    handleChange={handleFormChange}
                    properties={form}
                    invisibleFieldNames={invisibleFieldNames}
                  />
                  {children}
                </>
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
          download={downloadName}
        >
          Download Template
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
