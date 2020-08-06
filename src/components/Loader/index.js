import React from 'react';

function Loader() {
  return (
    <div style={{
      textAlign: 'center',
      color: '#1DC7EA',
      fontSize: '50px',
      width: '100%',
    }}
    >
      <i
        style={{
          width: '100px',
          lineHeight: '100px',
        }}
        className="fa fa-spinner fa-spin"
      />
    </div>
  );
}

export default Loader;
