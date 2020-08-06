/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from 'react';
import {
  FormGroup, ControlLabel, FormControl, Row,
} from 'react-bootstrap';

function FieldGroup({
  label, name, options, handleChange, ...props
}) {
  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      <FormControl
        onChange={(e) => handleChange(e, name)}
        {...props}
      >
        {options && options.map((option, i) => (
          <option value={option}>{option}</option>
        ))}
      </FormControl>
    </FormGroup>
  );
}

export class FormInputs extends Component {
  render() {
    const row = [];
    for (let i = 0; i < this.props.ncols.length; i++)
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
