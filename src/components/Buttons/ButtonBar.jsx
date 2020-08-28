/* eslint-disable no-use-before-define */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'react-bootstrap';

ButtonBar.propTypes = {
  buttonGroups: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
  ).isRequired,
  universalOptions: PropTypes.objectOf(PropTypes.string),
  containerStyle: PropTypes.objectOf(PropTypes.string),
  selectedField: PropTypes.string,
};

ButtonBar.defaultProps = {
  universalOptions: {},
  containerStyle: {},
  selectedField: false,
};

function ButtonBar({
  universalOptions,
  buttonGroups,
  containerStyle,
  selectedField,
}) {
  if (!buttonGroups)
    return null;

  return (
    <div style={{
      paddingBottom: '20px',
      justifyContent: 'center',
      ...containerStyle,
    }}
    >
      {buttonGroups.map((buttonGroup, gi) => (
        <ButtonGroup key={gi} style={{ paddingRight: '10px' }}>
          {buttonGroup.map((button, bi) => {
            const {
              text, size, color, icon, onClick, className, field,
            } = { ...universalOptions, ...button };
            return (
              <Button
                key={bi}
                bsSize={size}
                bsStyle={selectedField && selectedField !== field ? undefined : color}
                onClick={onClick}
                className={className || 'btn-fill'}
              >
                {icon && <i className={icon} />}
                {' '}
                {text}
              </Button>
            );
          })}
        </ButtonGroup>
      ))}
    </div>
  );
}

export default ButtonBar;
