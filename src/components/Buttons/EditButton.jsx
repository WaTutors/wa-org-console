import React from 'react';

import Edit from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';

function EditButton() {
  return (
    <IconButton aria-label="edit">
      <Edit fontSize="large" style={{ color: 'gray' }} />
    </IconButton>
  );
}

export default EditButton;
