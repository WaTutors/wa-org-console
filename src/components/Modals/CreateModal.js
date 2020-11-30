import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

import FormInputs from 'components/FormInputs/FormInputs';
import { createOrgThunk, createOrgFailure } from 'redux/ducks/user.duck';

function CreateModal({
  isOpen, toggleOpen, error, createOrg, setError, loading,
}) {
  const [orgName, setOrgName] = useState('');
  const [isSuccessVisible, showSuccess] = useState(false);

  const prevLoadingRef = useRef();

  useEffect(() => {
    prevLoadingRef.current = loading;
  });

  const prevLoading = prevLoadingRef.current;

  useEffect(() => {
    if (prevLoading && !loading && orgName)
      showSuccess(true);
  }, [prevLoading, loading, orgName]);

  return (
    <Modal
      show={isOpen}
      onHide={() => {
        setError(null);
        toggleOpen(false);
      }}
    >
      <Modal.Header closeButton style={{ fontWeight: '500' }}>
        Create Simulation
      </Modal.Header>
      <Modal.Body>
        <div>
          {isSuccessVisible ? (
            <div style={{ display: 'flex' }}>
              <p style={{ fontWeight: 500 }}>{orgName}</p>
              <p style={{ marginLeft: 5 }}>has been created!</p>
            </div>
          ) : (
            <>
              <p>Enter a new org name:</p>
              <FormInputs
                ncols={['col-xs-12']}
                handleChange={({ target: { value } }) => setOrgName(value)}
                properties={[{
                  name: 'property',
                  label: 'Org Name',
                  type: 'text',
                  bsClass: 'form-control',
                  placeholder: 'watutor_default',
                }]}
              />
              {error && error.message && <p style={{ color: 'red' }}>Org name is already taken.</p>}
            </>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {isSuccessVisible ? (
          <Button
            color="primary"
            onClick={() => {
              window.location = 'https://console.watutor.com/ext/login';
            }}
          >
            Login
          </Button>
        ) : (
          <>
            <Button color="secondary" onClick={() => toggleOpen(false)}>Cancel</Button>
            {' '}
            <Button disabled={loading} color="primary" onClick={() => createOrg(orgName)}>
              Create
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

CreateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  createOrg: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

CreateModal.defaultProps = {
  error: null,
};

const mapStateToProps = ({ userReducer }) => ({
  error: userReducer.error,
  loading: userReducer.loading,
});

const mapDispatchToProps = (dispatch) => ({
  createOrg: (name) => dispatch(createOrgThunk(name)),
  setError: (error) => dispatch(createOrgFailure(error)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateModal);
