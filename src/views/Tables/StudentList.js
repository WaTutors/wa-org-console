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
    label: 'Phone Number',
    type: 'tel',
    bsClass: 'form-control',
    placeholder: '503 123 1234',
  }, {
    name: 'labels',
    label: 'Private Labels (period seperated)',
    type: 'string',
    placeholder: 'Grade 4. Reading. Yakima',
  }, {
    name: 'name',
    label: 'User Full Name',
    type: 'string',
    placeholder: 'Robert Lewandowski',
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
            multi: true,
            componentClass: 'select',
            placeholder: 'select',
            options: value && value.map((item) => ({ value: item, label: allCapsToText([item]) })),
          });
        } else {
          form.push({
            name: key,
            label: key,
            checkboxes: true,
            options: value && value.map((item) => ({ value: item, label: allCapsToText([item]) })),
          });
        }
      }
    });

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
      processFile={(raw) => {
        const rows = raw.split('\n');
        return rows
          .slice(1) // remove header
          .map((row) => {
            const arr = row.split(',');
            return {
              phone: arr[0],
              labels: arr[1],
              name: arr[2],
            };
          });
      }}
      exampleFilePath="https://firebasestorage.googleapis.com/v0/b/watutors-1.appspot.com/o/public%2Forg_example_csvs%2Fstudents.csv?alt=media&token=2e173dd2-4ad7-4591-b9f6-9ab031e99824"
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
