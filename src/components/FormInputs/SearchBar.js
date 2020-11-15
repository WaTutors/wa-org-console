import React, { useState } from 'react';
import { PropTypes } from 'prop-types';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import {
  Form, FormGroup, FormControl, Button, InputGroup,
} from 'react-bootstrap';
import IconButton from '@material-ui/core/IconButton';
import Refresh from '@material-ui/icons/Refresh';

const animatedComponents = makeAnimated();

export default function SearchBar({
  setSearch, placeholder, addText, onAdd, controlId, onRefresh, options, setOptionFilter,
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
          <InputGroup style={{ flex: 1, flexDirection: 'row', display: 'flex' }}>
            <Select
              isSearchable
              className="basic-single"
              classNamePrefix="select"
              components={animatedComponents}
              defaultValue={selectedField}
              name={`${controlId}Select`}
              options={options}
              onChange={(option) => {
                setOptionFilter(option.value);
                selectField(option);
              }}
              styles={{
                control: (styles) => ({
                  ...styles,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  paddingTop: 1,
                  paddingBottom: 1,
                  width: 120,
                  borderColor: 'hsl(0, 0%, 90%)',
                }),
              }}
            />
            <FormControl
              placeholder={`Search by ${selectedField.label.toLowerCase()}...`}
              onChange={handleChange}
            />
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
  placeholder: PropTypes.string,
  addText: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  controlId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })),
  setOptionFilter: PropTypes.func.isRequired,
};

SearchBar.defaultProps = {
  placeholder: '',
  options: null,
};
