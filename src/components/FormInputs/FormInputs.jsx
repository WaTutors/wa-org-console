import React, { Component, useState } from 'react';
import {
  FormGroup, ControlLabel, FormControl, Row,
} from 'react-bootstrap';

function FieldGroup({
  label, name, options = false, handleChange, checkboxes, type, ...props
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

  const optionsRender = options
    ? renderOptions.map((option, i) => (
      // encode value as json because it gets forced to string in browser
      <option key={i} value={JSON.stringify(option.value)}>{option.label}</option>
    ))
    : null;

  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      {type !== 'search' && (
        <FormControl
          onChange={(e) => {
            if (options) // spoof e.target.value for json option value
              handleChange({ target: { value: JSON.parse(e.target.value) } }, name);
            else
              handleChange(e, name);
          }}
          type={type}
          {...props}
        >
          {optionsRender}
        </FormControl>
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
