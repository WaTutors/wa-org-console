/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import {
  Button, Label, Input,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';

import ButtonBar from 'components/Buttons/ButtonBar';
import FileDropzone from 'components/FormInputs/FileDropzone';
import FormInputs from 'components/FormInputs/FormInputs';

const CustomSlider = withStyles({
  valueLabel: {
    fontSize: 15,
  },
})(Slider);

const fields = [
  {
    title: 'Available Hours per Instructor',
    defaultValue: 12,
    step: 1,
    min: 1,
    max: 24,
  },
  {
    title: '% of Hours Booked',
    defaultValue: 50,
    step: 5,
    min: 0,
    max: 100,
  },
  {
    title: '% of Invites Accepted per Student',
    defaultValue: 50,
    step: 5,
    min: 0,
    max: 100,
  },
  {
    title: 'Searches for 1-1 Sessions per Student',
    defaultValue: 5,
    step: 1,
    min: 1,
    max: 10,
  },
  {
    title: 'Searches for Group Sessions per Student',
    defaultValue: 5,
    step: 1,
    min: 1,
    max: 10,
  },
];

export default function SimulationModal({ onSubmit, isOpen, toggleOpen }) {
  return (
    <Modal show={isOpen}>
      <Modal.Header closeButton style={{ fontWeight: '500' }}>
        Create Simulation
      </Modal.Header>
      <Modal.Body>
        <div>
          {fields.map(({
            title, defaultValue, step, min, max,
          }) => (
            <div style={{ marginBottom: 10 }}>
              <p>{title}</p>
              <CustomSlider
                defaultValue={defaultValue}
                getAriaValueText={(value) => value}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={step}
                min={min}
                max={max}
                style={{ color: '#3478f6' }}
              />
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="secondary" onClick={() => toggleOpen(false)}>Cancel</Button>
        {' '}
        <Button color="primary">Create</Button>
      </Modal.Footer>
    </Modal>
  );
}

SimulationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
};

SimulationModal.defaultProps = {
  onSubmit: (e) => console.log('form submitted', e),
};
