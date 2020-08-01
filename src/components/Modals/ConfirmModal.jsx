import React, { useState, useEffect } from 'react';
import {
  Button, Label, Input,
} from 'reactstrap';

import { Modal } from 'react-bootstrap';

function ConfirmModal({
  onConfirm, // function to execute when confirmed
  isOpen, toggleOpen, // is modal visible controls
  text = 'Warning: This cannot be undone', // message displayed in body of modal
  header = 'Confirm Action', // message displayed in header of modal
  confirmTextDisplay = 'To proceed type "Confirm" here and click Continue', // text displayed in hint
  confirmTextCheck = 'Confirm', // text checked against, if false no check will be done
  delay = false, // false or integer for wait time
}) {
  const [visible, setVisible] = useState(false);
  const [textCheck, setTextCheck] = useState('');

  console.log({ isOpen });

  const handleConfirm = () => {
    if (textCheck === confirmTextCheck || !confirmTextCheck) {
      // only continue if text is confirmed, or confirmTextCheck is false
      console.log({ onConfirm: typeof onConfirm });
      onConfirm(textCheck);
      toggleOpen();
    } // else do nothing
  };

  useEffect(() => {
    if (delay === false || isOpen === false) {
      setVisible(true);
    } else {
      setVisible(false);
      setTimeout(() => {
        setVisible(true);
      }, delay);
    }
  }, [isOpen, delay]);

  if (visible === false)
    return (
      <Modal show={isOpen} onHide={toggleOpen}>
        <Modal.Header closeButton>
          {header}
        </Modal.Header>
        <Modal.Body>
          <div style={{ justifyContent: 'center', width: '100%' }}>
            <h1>Loading...</h1>
          </div>
          <Button color="primary" onClick={handleConfirm} disabled>Continue</Button>
          {' '}
          <Button color="secondary" onClick={toggleOpen}>Cancel</Button>
        </Modal.Body>
      </Modal>
    );

  return (
    <Modal show={isOpen} onHide={toggleOpen}>
      <Modal.Header closeButton>
        {header}
      </Modal.Header>
      <Modal.Body>
        <div>
          <Label>{text}</Label>
          { confirmTextCheck
          && (
            <Input
              placeholder={confirmTextDisplay}
              value={textCheck}
              onChange={(e) => setTextCheck(e.target.value)}
            />
          )}
          <Label>{' '}</Label>
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

export default ConfirmModal;
