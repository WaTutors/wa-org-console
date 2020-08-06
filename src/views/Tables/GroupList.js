import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  getGroupsThunk, createGroupsThunk, removeGroupThunk,
} from 'redux/ducks/group.duck';
import TemplateList from './Template';

function GroupList({
  // redux props go brrrrr
  getData, addData, removeData, // functions
  dataList, loading, // variables
  ...props
}) {
  const rowData = useMemo(() => dataList.map((item) => ({
    members: ['frank'],
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    iid: item.iid,
    pid: item.pid,
  })), [dataList]);

  return (
    <TemplateList
      listName="Group"
      props={props}
      isLoading={loading}
      getData={getData}
      addData={addData}
      removeRow={removeData}
      columnDefs={[{
        headerName: 'Active', field: 'invite', flex: 0.5,
      }, {
        headerName: 'Subject', field: 'name',
      }, {
        headerName: '# Members', field: 'phone',
      }, {
        headerName: 'Members', field: 'completedSessions', sortable: true, flex: 0.75, filter: 'agNumberColumnFilter',
      }, {
        headerName: 'Upcoming Sessions', field: 'upcomingSessions', sortable: true, flex: 0.75, filter: 'agNumberColumnFilter',
      }, {
        headerName: 'Remove', cellRenderer: 'deleteButton', width: '64px', flex: 0.5,
      }]}
      rowData={rowData}
      hideAddFile
      addInfo="Groups are required to create sessions"
      addForm={[{
        name: 'Group Subject',
        label: 'property',
        type: 'select',
        componentClass: 'select',
        placeholder: 'select',
        options: ['1', '2'],
      }, {
        name: 'Invite Users',
        label: 'property',
        type: 'select',
        componentClass: 'select',
        placeholder: 'select',
        options: ['1', '2'],
      }]}
    />
  );
}

GroupList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ userReducer, groupsReducer }) => ({
  orgState: userReducer.org,
  loading: groupsReducer.loading,
  dataList: groupsReducer.list,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getGroupsThunk()),
  addData: (data) => dispatch(createGroupsThunk(data)),
  removeData: (data) => dispatch(removeGroupThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(GroupList);
