import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';

function Loader() {
  return (
    <Fade
      in
      style={{
        transitionDelay: '800ms',
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

export default Loader;
