import React, { useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  mapGroupMainAgGridRows, generateGroupMainAgGridColumns,
} from 'services/parsers/group.parser';
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
      return dataList.map(mapGroupMainAgGridRows);
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
      columnDefs={generateGroupMainAgGridColumns()}
      rowData={rowData}
      // hideAddFile
      addInfo="Groups are required to create sessions"
      addForm={[{
        name: 'name',
        label: 'Group Name (this will note be visible by users)',
        type: 'text',
        placeholder: 'Spring Cohort 52',
      }, {
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
      }]}
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
