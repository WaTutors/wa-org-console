import React, { useState } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';

import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';

import Loader from 'components/Loader';
import { runSimulationThunk } from 'redux/ducks/analytics.duck';

const CustomSlider = withStyles({
  valueLabel: {
    fontSize: 15,
  },
})(Slider);

const fields = [
  {
    title: 'Days to Simulate',
    defaultValue: 1,
    step: 1,
    min: 1,
    max: 7,
    id: 'days',
  },
  {
    title: 'Categories',
    defaultValue: 1,
    step: 1,
    min: 1,
    max: 1,
    id: 'categories',
  },
  {
    title: 'Number of Students',
    defaultValue: 10,
    step: 1,
    min: 1,
    max: 100,
    id: 'students',
  },
  {
    title: 'Number of Instructors',
    defaultValue: 10,
    step: 1,
    min: 1,
    max: 100,
    id: 'instructors',
  },
  {
    title: 'Available Hours per Instructor',
    defaultValue: 2,
    step: 1,
    min: 1,
    max: 10,
    id: 'available',
  },
  {
    title: '% of Instructors Accepting Recommendations',
    defaultValue: 100,
    step: 10,
    min: 0,
    max: 100,
    id: 'acceptance',
  },
  {
    title: 'Searches per Student',
    defaultValue: 1,
    step: 1,
    min: 1,
    max: 1,
    id: 'searches',
  },
  {
    title: 'Time of Searches',
    defaultValue: 14,
    step: 1,
    min: 0,
    max: 24,
    marks: [{
      value: 0,
      label: '12 AM',
    }, {
      value: 6,
      label: '6 AM',
    }, {
      value: 12,
      label: '12 PM',
    }, {
      value: 18,
      label: '6 PM',
    }, {
      value: 24,
      label: '12 AM',
    }],
    id: 'time',
  },
];

const hiddenFields = ['categories', 'acceptance', 'searches'];

const defaults = Object.fromEntries(
  fields.map(({ id, defaultValue }) => [id, defaultValue]),
);

function SimulationModal({
  isOpen, toggleOpen, status, runSimulation,
}) {
  const [formValues, setFormValues] = useState(defaults);
  const [isLoading, load] = useState(false);

  return (
    <Modal show={isOpen} onHide={() => setFormValues(defaults)}>
      <Modal.Header closeButton style={{ fontWeight: '500' }}>
        Create Simulation
      </Modal.Header>
      <Modal.Body>
        <div>
          {isLoading ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: 100 }}>
                <Loader transitionDelay="0ms" />
              </div>
              <p>{status}</p>
            </div>
          ) : fields.filter(({ id }) => !hiddenFields.includes(id)).map(({
            title, defaultValue, step, min, max, range, marks, id,
          }) => (
            <div key={id} style={{ marginBottom: 10 }}>
              <p>
                {`${title} - ${id === 'time' ? moment().set('hours', formValues[id]).format('h A') : formValues[id]}`}
              </p>
              <CustomSlider
                defaultValue={defaultValue}
                getAriaValueText={(value) => value}
                aria-labelledby={range ? 'range-slider' : 'discrete-slider'}
                valueLabelDisplay="auto"
                step={step}
                min={min}
                max={max}
                marks={marks}
                onChange={(_, value) => setFormValues({ ...formValues, [id]: value })}
                style={{ color: '#3478f6' }}
              />
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="secondary" onClick={() => toggleOpen(false)}>Cancel</Button>
        {' '}
        <Button
          disabled={isLoading}
          color="primary"
          onClick={() => {
            load(true);
            runSimulation(formValues)
              .then(() => {
                load(false);
                toggleOpen(false);
              });
          }}
        >
          Run
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

SimulationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  runSimulation: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
};

const mapStateToProps = ({ analyticsReducer }) => ({
  status: analyticsReducer.status,
});

const mapDispatchToProps = (dispatch) => ({
  runSimulation: (options) => dispatch(runSimulationThunk(options)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SimulationModal);
