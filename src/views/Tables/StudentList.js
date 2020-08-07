import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getStudentsThunk, inviteStudentsThunk, removeStudentThunk } from 'redux/ducks/student.duck';
import TemplateList from './Template';

function StudentList({
  // redux props go brrrrr
  getData, addData, removeData, // functions
  dataList, loading, // variables
  ...props
}) {
  const rowData = useMemo(() => dataList.map((item) => ({
    invite: Boolean(item.profile),
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: item.profile ? item.phone : item.to,
    groupNum: item.recentGroups ? Object.keys(item.recentGroups).length : 0,
    groups: item.recentGroups ? Object.keys(item.recentGroups) : undefined,
    iid: item.iid,
    pid: item.pid,
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
        headerName: 'Active', field: 'invite', flex: 0.5,
      }, {
        headerName: 'Name', field: 'name',
      }, {
        headerName: 'Phone Number', field: 'phone',
      }, {
        headerName: '# Groups', field: 'groupNum', sortable: true, flex: 0.75,
      }, {
        headerName: 'Group Subjects', field: 'groups', sortable: true, flex: 1.5,
      }, {
        headerName: 'Remove', cellRenderer: 'deleteButton', width: '64px', flex: 0.5,
      }]}
      rowData={rowData}
      /* example
      rowData={[
      {invite: true, name: 'Tonya Harding', phone: '+1 59333384448',
        groupNum: 3, groups: ['Beginner Piano', 'Math 4', 'ESL'],},
      {invite: false, phone: '+1 25688484862'}
      ]}
      */
    />
  );
}

StudentList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ userReducer, studentsReducer }) => ({
  orgState: userReducer.org,
  loading: studentsReducer.loading,
  dataList: studentsReducer.list,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getStudentsThunk()),
  addData: (inputData) => dispatch(inviteStudentsThunk(inputData.phone)),
  removeData: (data) => dispatch(removeStudentThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(StudentList);
