import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  mapStudentMainAgGridRows, generateStudentMainAgGridColumns, allCapsToText,
} from 'services/parsers/student.parser';
import {
  getStudentsThunk, inviteStudentsThunk, removeStudentThunk, editStudentThunk,
} from 'redux/ducks/student.duck';
import TemplateList from './Template';

function StudentList({
  // redux props go brrrrr
  getData, addData, removeData, editData, // functions
  dataList, properties, loading, orgState, orgReservedProps, // variables
  ...props
}) {
  const consumerProps = (orgReservedProps && orgReservedProps.consumer) || null;
  const rowData = useMemo(() => dataList
    .map((item) => mapStudentMainAgGridRows(item, orgState, consumerProps)),
  [dataList]);

  const form = [{
    name: 'phone',
    csvlabel: 'Contact (Phone or Email)',
    label: 'Contact (Phone or Email)',
    type: 'tel',
    bsClass: 'form-control',
    placeholder: '503 123 1234',
  }, /* {
    name: 'labels',
    csvlabel: 'Additional Labels',
    label: 'Private Labels (period seperated)',
    type: 'string',
    placeholder: 'Grade 4. Reading. Yakima',
  } */ ];
  // console.log('studentlist props', { consumerProps });

  if (consumerProps)
    Object.entries(consumerProps).sort().forEach(([key, value]) => {
      if (Array.isArray(value))
        if (value.length > 0) {
          form.push({
            name: key,
            label: key,
            csvlabel: key,
            multi: true,
            componentClass: 'select',
            placeholder: 'select',
            options: value && value.map((item) => ({ value: item, label: allCapsToText([item]) })),
          });
        } else {
          form.push({
            name: key,
            label: key,
            csvlabel: key,
            checkboxes: true,
            options: value && value.map((item) => ({ value: item, label: allCapsToText([item]) })),
          });
        }
      else if (value === 'TEXT')
        form.push({
          name: key,
          label: key,
          csvlabel: key,
          type: 'string',
          placeholder: 'Text here',
        });
    });

  const editForm = [{
    name: 'properties',
    label: 'Assigned Subjects (for tutoring)',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    multi: true,
    options: properties && (orgState === 'watutor_default'
      ? properties.map((item) => ({ value: item.split('_')[1], label: item.split('_')[1] }))
      : properties.map((item) => ({ value: item, label: item }))),
  }];

  function handleEditSubmit(e) {
    console.log('StudentList handleEditSubmit', e);
    editData(e);
  }

  const csvContent = `data:text/csv;charset=utf-8, ${form.map((item) => item.csvlabel).join(',')}\n`;
  const encodedUri = encodeURI(csvContent);

  return (
    <TemplateList
      listName="Student"
      props={props}
      isLoading={loading}
      getData={getData}
      addData={addData}
      removeRow={removeData}
      columnDefs={generateStudentMainAgGridColumns(
        orgState === 'watutor_default' ? ['invite'] : ['org'],
        consumerProps,
      )}
      rowData={rowData}
      addForm={form}
      editForm={editForm}
      onEditSubmit={handleEditSubmit}
      downloadName={`add_student_${orgState}.csv`}
      processFile={(raw) => {
        const rows = raw.split('\n');
        const validRows = rows.filter((row) => row !== '');
        return validRows
          .slice(1) // remove header
          .map((row) => {
            const arr = row.split(',');
            const csvCols = form.map((item) => item.name);
            // console.log('provider processFile', { csvCols, arr });
            return csvCols
              .reduce((obj, key, i) => { //
                console.log({ res: form[i] });
                const freeTextPrefix = form[i].type === 'string'
                  ? `${key}_`
                  : ''; // for freeform'
                return { ...obj, [key]: freeTextPrefix + arr[i] };
              }, { fromParseFile: true });
          });
      }}
      exampleFilePath={encodedUri}
    />
  );
}

StudentList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  editData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  properties: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  orgState: PropTypes.string.isRequired,
  orgReservedProps: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const mapStateToProps = ({ userReducer, studentsReducer }) => ({
  orgState: userReducer.org,
  loading: studentsReducer.loading,
  dataList: studentsReducer.list,
  properties: userReducer.properties,
  orgReservedProps: userReducer.reservedLabels,
});
const mapDispatchToProps = (dispatch) => ({
  getData: () => dispatch(getStudentsThunk()),
  addData: (inputData) => dispatch(inviteStudentsThunk(inputData)),
  removeData: (data) => dispatch(removeStudentThunk(data)),
  editData: (payload) => dispatch(editStudentThunk(payload)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(StudentList);
