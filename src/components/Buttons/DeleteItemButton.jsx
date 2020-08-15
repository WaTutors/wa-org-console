import React from 'react';

function DeleteButton() {
  return (
    <div style={{
      fontSize: '32px',
      color: 'white',
      background: 'red',
      borderRadius: '100%',
      justifyContent: 'center',
      textAlign: 'center',
      maxWidth: '40px',
    }}
    >
      <i className="pe-7s-trash" />
    </div>
  );
}

export default DeleteButton;
