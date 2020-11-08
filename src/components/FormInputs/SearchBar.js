import React, { useState } from 'react';
import { PropTypes } from 'prop-types';

import {
  Form, FormGroup, FormControl, Button, InputGroup, DropdownButton, MenuItem,
} from 'react-bootstrap';
import IconButton from '@material-ui/core/IconButton';
import Refresh from '@material-ui/icons/Refresh';

export default function SearchBar({
  setSearch, placeholder, addText, onAdd, controlId, onRefresh, options,
}) {
  const [selectedField, selectField] = useState(options ? options[0] : '');

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <Form
      horizontal
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FormGroup
        controlId={controlId}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginRight: 0,
          marginLeft: 0,
        }}
      >
        {options ? (
          <InputGroup style={{ flex: 1 }}>
            <DropdownButton
              componentClass={InputGroup.Button}
              id="input-dropdown-show"
              title={selectedField}
            >
              {options.map((option, index) => (
                <MenuItem
                  eventKey={index}
                  active={selectedField === option}
                  onSelect={() => selectField(option)}
                  open
                >
                  {option}
                </MenuItem>
              ))}
            </DropdownButton>
            <FormControl placeholder={placeholder} onChange={handleChange} />
          </InputGroup>
        ) : <FormControl placeholder={placeholder} onChange={handleChange} />}
        <IconButton
          aria-label="refresh"
          onClick={onRefresh}
          size="small"
          style={{ marginRight: 10, marginLeft: 10 }}
        >
          <Refresh style={{ color: 'gray', fontSize: 30 }} />
        </IconButton>
        <Button
          bsSize="medium"
          bsStyle="info"
          onClick={onAdd}
          className="btn-fill"
          style={{
            fontWeight: 500,
            borderRadius: 10,
          }}
        >
          {addText}
        </Button>
      </FormGroup>
    </Form>
  );
}

SearchBar.propTypes = {
  setSearch: PropTypes.func.isRequired,
};
