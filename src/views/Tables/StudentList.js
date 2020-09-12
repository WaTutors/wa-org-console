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

  let form = [{
    name: 'phone',
    csvlabel: 'Phone Number',
    label: 'Phone Number',
    type: 'tel',
    bsClass: 'form-control',
    placeholder: '503 123 1234',
  }, {
    name: 'name',
    csvlabel: 'Full Name',
    label: 'User Full Name',
    type: 'string',
    placeholder: 'Robert Lewandowski',
  }, {
    name: 'labels',
    csvlabel: 'Additional Labels',
    label: 'Private Labels (period seperated)',
    type: 'string',
    placeholder: 'Grade 4. Reading. Yakima',
  }];

  if (consumerProps)
    Object.entries(consumerProps).sort().forEach(([key, value]) => {
      // value.push("t1")
      // value.push("t2")
      // value.push("t3")
      // value.push("t4")
      // value.push("t5")
      if (Array.isArray(value)) {
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
      }
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
        return rows
          .slice(1) // remove header
          .map((row) => {
            const arr = row.split(',');
            const allLabels = arr.slice(2).join('.');
            return {
              phone: arr[0],
              name: arr[1],
              labels: allLabels,
            };
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
  orgReservedProps: PropTypes.array.isRequired,
};

const mapStateToProps = ({ userReducer, studentsReducer }) => ({
  orgState: userReducer.org,
  loading: studentsReducer.loading,
  dataList: studentsReducer.list,
  orgReservedProps: userReducer.reservedProperties,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getStudentsThunk()),
  addData: (inputData) => dispatch(inviteStudentsThunk(inputData)),
  removeData: (data) => dispatch(removeStudentThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(StudentList);
