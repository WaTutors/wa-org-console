import React from 'react';

import DeleteForever from '@material-ui/icons/DeleteForever';
import IconButton from '@material-ui/core/IconButton';

function DeleteButton() {
  return (
    <IconButton aria-label="delete">
      <DeleteForever fontSize="medium" style={{ color: '#fa282d' }} />
    </IconButton>
  );
}

export default DeleteButton;
