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
    title: 'Number of Students',
    defaultValue: 5,
    step: 1,
    min: 1,
    max: 20,
  },
  {
    title: 'Number of Instructors',
    defaultValue: 5,
    step: 1,
    min: 1,
    max: 20,
  },
  {
    title: 'Available Hours per Instructor',
    defaultValue: 2,
    step: 1,
    min: 1,
    max: 10,
  },
  {
    title: '% of Instructors Accepting Recommendations',
    defaultValue: 50,
    step: 5,
    min: 0,
    max: 100,
  },
  {
    title: 'Time of Searches',
    defaultValue: [6, 12],
    step: 1,
    min: 0,
    max: 24,
    range: true,
    marks: [{
      value: 0,
      label: '12:00 AM',
    }, {
      value: 6,
      label: '6:00 AM',
    }, {
      value: 12,
      label: '12:00 PM',
    }, {
      value: 18,
      label: '6:00 PM',
    }, {
      value: 24,
      label: '12:00 AM',
    }],
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
            title, defaultValue, step, min, max, range, marks,
          }) => (
            <div style={{ marginBottom: 10 }}>
              <p>{title}</p>
              <CustomSlider
                defaultValue={defaultValue}
                getAriaValueText={(value) => value}
                aria-labelledby={range ? 'range-slider' : 'discrete-slider'}
                valueLabelDisplay="auto"
                step={step}
                min={min}
                max={max}
                marks={marks}
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
