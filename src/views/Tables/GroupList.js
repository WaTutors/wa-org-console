import React, { useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  mapGroupMainAgGridRows, generateGroupMainAgGridColumns,
} from 'services/parsers/group.parser';
import { parseNameFromStudent } from 'services/parsers/student.parser';
import {
  getGroupsThunk, createGroupsThunk, removeGroupThunk, editMembersGroupThunk,
} from 'redux/ducks/group.duck';
import { getOrgSummaryThunk } from 'redux/ducks/user.duck';
import TemplateList from './Template';

function GroupList({
  // redux props go brrrrr
  getData, getProperties, addData, removeData, editMembers, // functions
  dataList, loading, properties, studentList, orgState, // variables
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

  const activeStudents = useMemo(() => {
    if (studentList)
      return studentList.filter((doc) => doc.profile); // if accepted invite
    return [];
  }, [studentList]);

  const groupForm = useMemo(() => [{
    name: 'name',
    label: 'Group Name (this will note be visible by users)',
    csvlabel: 'Group Name',
    type: 'text',
    placeholder: 'Spring Cohort 52',
  }, {
    name: 'subject',
    label: 'Group Subject',
    csvlabel: 'Group Subject',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    options: properties && properties.map((item) => ({ value: item, label: item })),
  }, {
    name: 'info',
    label: 'Group Description',
    csvlabel: 'Group Description',
    type: 'text',
    placeholder: 'This group is for ...',
  }, {
    name: 'notHidden',
    label: 'Is visible to users?',
    csvlabel: 'Is visible to users?',
    componentClass: 'select',
    placeholder: 'select',
    options: [true, false].map((item) => ({ value: item, label: item ? 'Yes' : 'No' })),
  }, {
    name: 'students',
    label: 'Add Students',
    csvlabel: 'Add Students (period seperated)',
    multi: true,
    componentClass: 'select',
    placeholder: 'select',
    options: activeStudents.map((item) => ({ value: item, label: parseNameFromStudent(item) })),
  }], [activeStudents, properties]);

  const csvContent = `data:text/csv;charset=utf-8, ${
    groupForm.map((item) => item.csvlabel).join(',')
  }\n`;
  const encodedUri = encodeURI(csvContent);

  return (
    <TemplateList
      addText="Add group"
      controlId="searchGroup"
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
      addForm={groupForm}
      processFile={(raw) => {
        console.log('process file', raw);
        const rows = raw.split('\n');
        const validRows = rows.filter((row) => row !== '');
        return validRows
          .slice(1) // remove header
          .map((row) => {
            const arr = row.split(',');
            return {
              name: arr[0],
              info: arr[1],
              subject: arr[2],
              students: arr[3],
            };
          });
      }}
      downloadName={`add_groups_${orgState}.csv`}
      exampleFilePath={encodedUri}
      searchOptions={[{
        label: 'Description',
        value: 'info',
      }, {
        label: 'Member',
        value: 'members',
      }]}
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
  studentList: PropTypes.arrayOf(PropTypes.string).isRequired,
  orgState: PropTypes.string.isRequired,
};

const mapStateToProps = ({ userReducer, groupsReducer, studentsReducer }) => ({
  orgState: userReducer.org,
  loading: groupsReducer.loading,
  dataList: groupsReducer.list,
  properties: userReducer.properties,
  studentList: studentsReducer.list,
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
