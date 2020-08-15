import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getStudentsThunk, inviteStudentsThunk, removeStudentThunk } from 'redux/ducks/student.duck';
import TemplateList from './Template';

function StudentList({
  // redux props go brrrrr
  getData, addData, removeData, // functions
  dataList, loading, orgState, // variables
  ...props
}) {
  const rowData = useMemo(() => dataList.map((item) => ({
    invite: item.profile ? 'Accepted' : 'Sent',
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: item.profile && typeof item.phone === 'string' ? item.phone : item.to,
    labels: item.profile
      ? item.profile.org
        .filter((str) => str.includes(orgState) && str !== orgState)
        .map((str) => str.replace(`${orgState}_`, ''))
      : item.labels,
    // groupNum: item.recentGroups ? Object.keys(item.recentGroups).length : 0,
    // groups: item.recentGroups ? Object.keys(item.recentGroups) : undefined,
    iid: item.iid,
    pid: item.pid,
    id: `u~${item.pid || item.iid}`,
  })), [dataList]);

  return (
    <TemplateList
      listName="Student"
      props={props}
      isLoading={loading}
      getData={getData}
      addData={addData}
      removeRow={removeData}
      columnDefs={[{
        headerName: 'Invite', field: 'invite', flex: 0.5,
      }, {
        headerName: 'Name', field: 'name',
      }, {
        headerName: 'Phone Number', field: 'phone',
      }, {
        headerName: 'Labels', field: 'labels', flex: 1.25,
      }, {
        headerName: 'Remove', cellRenderer: 'deleteButton', width: 64, flex: 0.5,
      }]}
      rowData={rowData}
      /* example
      rowData={[
      headerName: '# Groups', field: 'groupNum', sortable: true, flex: 0.75,}
      headerName: 'Group Subjects', field: 'groups', sortable: true, flex: 1.5,}
      invite: true, name: 'Tonya Harding', phone: '+1 59333384448',
          groupNum: 3, groups: ['Beginner Piano', 'Math 4', 'ESL'],}
      invite: false, phone: '+1 25688484862'}
      */
      addForm={[{
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        bsClass: 'form-control',
        placeholder: '+1 5031231234',
      }, {
        name: 'labels',
        label: 'Private Labels (period seperated)',
        type: 'string',
        placeholder: 'Grade 4. Reading. Yakima',
      }]}
      processFile={(raw) => {
        const rows = raw.split('\n');
        return rows
          .slice(1) // remove header
          .map((row) => {
            const arr = row.split(',');
            return {
              phone: arr[0],
              labels: arr[1],
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
};

const mapStateToProps = ({ userReducer, studentsReducer }) => ({
  orgState: userReducer.org,
  loading: studentsReducer.loading,
  dataList: studentsReducer.list,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getStudentsThunk()),
  addData: (inputData) => dispatch(inviteStudentsThunk(inputData)),
  removeData: (data) => dispatch(removeStudentThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(StudentList);
