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
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';

import { Card } from 'components/Card/Card.jsx';
import { FormInputs } from 'components/FormInputs/FormInputs.jsx';
import Button from 'components/Buttons/CustomButton.jsx';

// eslint-disable-next-line no-use-before-define
SearchForm.propTypes = {
  searchType: PropTypes.string.isRequired,
  searchProperties: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.string),
  ).isRequired,
  cols: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  onSearch: PropTypes.func,
};

function SearchForm({
  searchType,
  searchProperties, // example: [{string: 'fieldName', type: 'text'}]
  cols,
  onSearch = (e) => console.log('Search form submit triggered'),
}) {
  const [formData, setFormData] = useState();

  function handleSubmit(e) {
    e.preventDefault();

    onSearch(formData);
  }

  function handleChange(e, name) {
    setFormData({
      ...formData,
      [name]: e.target.value,
    });
  }

  return (
    <div className="content">
      <Card
        title={`Search ${searchType}`}
        content={(
          <form onSubmit={handleSubmit} style={{ paddingBottom: '1rem' }}>
            <FormInputs
              ncols={cols}
              handleChange={handleChange}
              properties={searchProperties}
            />

            <Button bsStyle="info" pullRight fill type="submit">
              Search
              {' '}
              {searchType}
            </Button>
          </form>
        )}
      />
    </div>
  );
}

export default SearchForm;
