import React from 'react';

import Delete from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';

export default function DeleteButton() {
  return (
    <IconButton aria-label="delete">
      <Delete fontSize="large" style={{ color: '#fa282d' }} />
    </IconButton>
  );
}
