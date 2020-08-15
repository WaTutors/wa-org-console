import React from 'react';

function AddUserButton() {
  return (
    <div style={{
      fontSize: '32px',
      color: 'white',
      background: 'green',
      borderRadius: '100%',
      justifyContent: 'center',
      textAlign: 'center',
      maxWidth: '40px',
    }}
    >
      <i className="pe-7s-add-user" />
    </div>
  );
}

export default AddUserButton;
