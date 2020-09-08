import React, { Component, useState } from 'react';
import {
  FormGroup, ControlLabel, FormControl, Row, HelpBlock,
} from 'react-bootstrap';
import Select from 'react-select';

function FieldGroup({
  label, name, options = false, handleChange, checkboxes, type, help, ...props
}) {
  const [checkboxData, setCheckboxData] = useState({});

  let renderOptions = false;
  if (options)
    renderOptions = [{ value: undefined, label: 'Select...' }, ...options];

  if (checkboxes) {
    const onCheckbox = (option) => {
      const formData = { target: { value: !checkboxData[option.value] } };
      handleChange(formData, option.value);
      const newData = { ...checkboxData, [option.value]: !checkboxData[option.value] };
      setCheckboxData(newData);
      console.log('checkbox', { option, newData });
    };
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        {
          options && options.map((option, i) => (
            <Row
              key={i}
              style={{ paddingLeft: '30px' }}
              onClick={(e) => onCheckbox(option)}
            >
              <input
                onClick={(e) => console.log('ckbox', e.target.value)}
                key={i}
                type="checkbox"
                checked={checkboxData[option.label]}
              />
              {' '}
              {option.label}
            </Row>
          ))
        }
      </FormGroup>
    );
  }

  if (options)
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <Select
          isClearable
          isSearchable
          className="basic-single"
          classNamePrefix="select"
          name={name}
          options={options}
          onChange={(e) => e && handleChange({ target: { value: e.value } }, name)}
        />
      </FormGroup>
    );

  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      {type !== 'search' && (
        <>
          <FormControl
            onChange={(e) => handleChange(e, name)}
            type={type}
            {...props}
          />
          {!!help && (
            <HelpBlock>{help}</HelpBlock>
          )}
        </>
      )}
    </FormGroup>
  );
}

export class FormInputs extends Component {
  render() {
    const invisibleFieldNames = this.props.invisibleFieldNames || [];
    const row = [];
    for (let i = 0; i < this.props.ncols.length; i++)
      if (!invisibleFieldNames.includes(this.props.properties[i].name))
        row.push(
          <div key={i} className={this.props.ncols[i]}>
            <FieldGroup
              handleChange={this.props.handleChange}
              {...this.props.properties[i]}
            />
          </div>,
        );

    return <Row>{row}</Row>;
  }
}

export default FormInputs;
