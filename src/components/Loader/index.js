import React from 'react';
import { PropTypes } from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';

export default function Loader({ transitionDelay }) {
  return (
    <Fade
      in
      style={{
        transitionDelay,
      }}
      unmountOnExit
    >
      <div style={{
        margin: 0,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        msTransform: 'translate(-50%, -50%)',
      }}
      >
        <CircularProgress size={50} style={{ color: '#3478f6' }} />
      </div>
    </Fade>
  );
}

Loader.propTypes = {
  transitionDelay: PropTypes.string,
};

Loader.defaultProps = {
  transitionDelay: '800ms',
};
