import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  inviteStudentsThunk, removeStudentThunk,
} from 'redux/ducks/student.duck';
import {
  generatePropertyMainAgGridColumns, mapPropertyMainAgGridRows,
} from 'services/parsers/property.parser';
import { getOrgSummaryThunk, setOrgSummaryPropertiesThunk } from 'redux/ducks/user.duck';
import TemplateList from './Template';

function PropertyList({
  getData, addData, removeData, setProperties,
  dataList, properties, loading, orgState, alias,
  ...props
}) {
  const rowData = useMemo(() => dataList
    .map((item) => mapPropertyMainAgGridRows(item)),
  [dataList]);

  const form = [{
    name: 'property',
    label: `New ${alias.property}`,
    type: 'text',
    bsClass: 'form-control',
    placeholder: alias.property,
  }];

  const editForm = [{
    name: 'property',
    label: '',
    type: 'text',
    bsClass: 'form-control',
    placeholder: alias.property,
    defaultValue: '',
  }];

  const handleAdd = (data) => {
    if (Array.isArray(data.property))
      return setProperties([...properties, ...data.property]);
    return setProperties([...properties, data.property]);
  };

  function handleEditSubmit(selectedRow) {
    console.log('PropertyList handleEditSubmit', selectedRow);
    setProperties([
      ...properties.filter((el) => el !== selectedRow.id),
      form.property,
    ]);
  }

  return (
    <TemplateList
      addInfo={`${alias.properties} are central to providing context to the platform. Groups, sessions, and ${alias.providers.toLowerCase()} can be labeled with properties. For example, a ${alias.property.toLowerCase()} of "Beginning Spanish" will be for early Spanish learners.`}
      addText={`Add ${alias.property.toLowerCase()}`}
      controlId="propertySearch"
      listName={alias.property}
      props={props}
      isLoading={loading}
      getData={getData}
      addData={handleAdd}
      removeRow={({ id }) => {
        setProperties(properties.filter((property) => property !== id));
      }}
      columnDefs={generatePropertyMainAgGridColumns(orgState !== 'watutor_default'
        ? ['vertical', 'length', 'price'] : [])}
      rowData={rowData}
      addForm={form}
      editForm={editForm}
      editHeader={`Edit ${alias.property}`}
      onEditSubmit={handleEditSubmit}
      downloadName={`add_student_${orgState}.csv`}
      placeholder={`Search by ${alias.property.toLowerCase()}...`}
      processFile={(raw) => ({ property: raw.split(',') })}
    />
  );
}

PropertyList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  setProperties: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  properties: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  orgState: PropTypes.string.isRequired,
  alias: PropTypes.shape({
    property: PropTypes.string,
    properties: PropTypes.string,
    providers: PropTypes.string,
  }),
};

PropertyList.defaultProps = {
  alias: {
    property: 'Category',
    properties: 'Categories',
    providers: 'Instructors',
  },
};

const mapStateToProps = ({ userReducer, studentsReducer }) => ({
  orgState: userReducer.org,
  loading: studentsReducer.loading,
  dataList: userReducer.properties,
  properties: userReducer.properties,
  alias: userReducer.alias,
});

const mapDispatchToProps = (dispatch) => ({
  getData: () => dispatch(getOrgSummaryThunk()),
  removeData: (data) => dispatch(removeStudentThunk(data)),
  setProperties: (payload) => dispatch(setOrgSummaryPropertiesThunk(payload)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(PropertyList);
