import React, { useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  getGroupsThunk, createGroupsThunk, removeGroupThunk, editMembersGroupThunk,
} from 'redux/ducks/group.duck';
import { getOrgSummaryThunk } from 'redux/ducks/user.duck';
import TemplateList from './Template';

function GroupList({
  // redux props go brrrrr
  getData, getProperties, addData, removeData, editMembers, // functions
  dataList, loading, properties, // variables
  ...props
}) {
  useEffect(() => {
    if (!properties || properties.includes('Loading...'))
      getProperties();
  }, []);

  const rowData = useMemo(() => {
    if (dataList)
      return dataList.map((item) => ({
        subjects: item.properties,
        info: item.info,
        members: item.activeMembers
          ? item.activeMembers.map((pid) => item.members[pid] && item.members[pid].name.split('~')[0])
          : [],
        activeMembers: item.activeMembers,
        numMembers: item.activeMembers ? item.activeMembers.length : 0,
        created: item.created ? new Date(item.created._seconds * 1000) : new Date(),
        gid: item.gid,
        id: `g~${item.gid}`,
      }));
    return [];
  }, [dataList]);

  return (
    <TemplateList
      listName="Group"
      manageMembersFor="Group"
      props={props}
      isLoading={loading}
      getData={getData}
      addData={addData}
      removeRow={removeData}
      columnDefs={[{
        headerName: 'Description', field: 'info', sortable: true, flex: 1.5,
      }, {
        headerName: 'Subjects', field: 'subjects', sortable: true,
      }, {
        headerName: 'Created', field: 'created', sortable: true, filter: 'agDateColumnFilter',
      }, {
        headerName: '# Members', field: 'numMembers', flex: 0.5, sortable: true, filter: 'agNumberColumnFilter',
      }, {
        headerName: 'Members', field: 'members', sortable: true,
      }, {
        headerName: 'Manage', cellRenderer: 'addUserButton', width: 64, flex: 0.5,
      }, {
        headerName: 'Delete', cellRenderer: 'deleteItem', width: 64, flex: 0.5,
      }]}
      rowData={rowData}
      // hideAddFile
      addInfo="Groups are required to create sessions"
      addForm={[{
        name: 'subject',
        label: 'Group Subject',
        type: 'select',
        componentClass: 'select',
        placeholder: 'select',
        options: properties && properties.map((item) => ({ value: item, label: item })),
      }, /* deprecated bc only one option {
        name: 'type',
        label: 'Group Type',
        type: 'select',
        componentClass: 'select',
        placeholder: 'select',
        options: ['private'],
      }, */ {
        name: 'info',
        label: 'Group Description',
        type: 'text',
        placeholder: 'This group is for ...',
      }, /* deprecated bc of user manager {
        name: 'invitees',
        label: 'Invite Users By Phone Number (period seperated)',
        type: 'tel',
        bsClass: 'form-control',
        placeholder: '+1 5031231234.+1 2141291288',
      } */]}
      processFile={(raw) => {
        console.log('process file', raw);
        const rows = raw.split('\n');
        return rows
          .slice(1) // remove header
          .map((row) => {
            const arr = row.split(',');
            return {
              info: arr[0],
              subject: arr[1],
            };
          });
      }}
      exampleFilePath="https://firebasestorage.googleapis.com/v0/b/watutors-1.appspot.com/o/public%2Forg_example_csvs%2Fgroups.csv?alt=media&token=12a97b65-4d09-4c6e-854c-0ea5329d53f8"
    />
  );
}

GroupList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  editMembers: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  properties: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  getProperties: PropTypes.func.isRequired,
};

const mapStateToProps = ({ userReducer, groupsReducer }) => ({
  orgState: userReducer.org,
  loading: groupsReducer.loading,
  dataList: groupsReducer.list,
  properties: userReducer.properties,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getGroupsThunk()),
  addData: (data) => dispatch(createGroupsThunk(data)),
  getProperties: () => dispatch(getOrgSummaryThunk()),
  removeData: (data) => dispatch(removeGroupThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(GroupList);