import React from 'react';

import PersonAdd from '@material-ui/icons/PersonAdd';
import IconButton from '@material-ui/core/IconButton';

function DeleteButton() {
  return (
    <IconButton aria-label="manage">
      <PersonAdd fontSize="large" style={{ color: '#00bb3b' }} />
    </IconButton>
  );
}

export default DeleteButton;
