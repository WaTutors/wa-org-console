import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  mapStudentMainAgGridRows, generateStudentMainAgGridColumns, allCapsToText,
} from 'services/parsers/student.parser';
import { getStudentsThunk, inviteStudentsThunk, removeStudentThunk } from 'redux/ducks/student.duck';
import TemplateList from './Template';

function StudentList({
  // redux props go brrrrr
  getData, addData, removeData, // functions
  dataList, loading, orgState, orgReservedProps, // variables
  ...props
}) {
  const consumerProps = orgReservedProps.consumer || null;
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
        if (value.length > 5) {
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
      columnDefs={generateStudentMainAgGridColumns([], consumerProps)}
      rowData={rowData}
      addForm={form}
      downloadName="student_template.csv"
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
              .reduce((obj, key, i) => ( //
                { ...obj, [key]: arr[i] }
              ), {});
          });
      }}
      exampleFilePath={encodedUri}
    />
  );
}

StudentList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
  orgState: PropTypes.string.isRequired,
  orgReservedProps: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const mapStateToProps = ({ userReducer, studentsReducer }) => ({
  orgState: userReducer.org,
  loading: studentsReducer.loading,
  dataList: studentsReducer.list,
  orgReservedProps: userReducer.reservedLabels,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getStudentsThunk()),
  addData: (inputData) => dispatch(inviteStudentsThunk(inputData)),
  removeData: (data) => dispatch(removeStudentThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(StudentList);
