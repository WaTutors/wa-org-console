/* eslint-disable no-use-before-define */
import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Button, Label, Input,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

import {
  mapStudentMembersAgGridRows, generateStudentMembersAgGridColumns,
} from 'services/parsers/student.parser';
import {
  mapGroupMembersAgGridRows, generateGroupMembersAgGridColumns,
} from 'services/parsers/group.parser';
import {
  mapProviderMembersAgGridRows, generateProviderMembersAgGridColumns,
} from 'services/parsers/provider.parser';
import { getStudentsThunk } from 'redux/ducks/student.duck';
import { getProvidersThunk } from 'redux/ducks/provider.duck';
import { getGroupsThunk, editMembersGroupThunk } from 'redux/ducks/group.duck';
import { editMembersSessionThunk } from 'redux/ducks/session.duck';
import { AgGridReact } from 'ag-grid-react';
import Loader from 'components/Loader';
import CustomCheckbox from 'components/CustomCheckbox/CustomCheckbox';
import ButtonBar from 'components/Buttons/ButtonBar';

ManageMembersModal.propTypes = {
  header: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  itemData: PropTypes.objectOf(PropTypes.any).isRequired,
  toggleOpen: PropTypes.func.isRequired,
  infoText: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  studentList: PropTypes.objectOf(PropTypes.any).isRequired,
  groupList: PropTypes.objectOf(PropTypes.any).isRequired,
  providerList: PropTypes.objectOf(PropTypes.any).isRequired,
  orgState: PropTypes.string.isRequired,
  defaultMembersOf: PropTypes.oneOf(['Session', 'Group']).isRequired,
  getStudentData: PropTypes.func.isRequired,
  getGroupData: PropTypes.func.isRequired,
  getProviderData: PropTypes.func.isRequired,
  editMembersGroup: PropTypes.func.isRequired,
  editMembersSession: PropTypes.func.isRequired,
};

ManageMembersModal.defaultProps = {
  infoText: '',
};

const SOURCE = { students: 'students', teachers: 'teachers', groups: 'groups' };

function ManageMembersModal({
  header, infoText, orgState, defaultMembersOf,
  isOpen, toggleOpen,
  itemData, isLoading, studentList, groupList, providerList,
  getStudentData, getGroupData, getProviderData,
  editMembersGroup, editMembersSession,
}) {
  const [gridApi, setGridApi] = useState(null);
  const [membersOf, setMembersOf] = useState(defaultMembersOf);
  useEffect(() => { setMembersOf(defaultMembersOf); }, [defaultMembersOf]);
  const [tableDataSource, setTableDataSource] = useState(
    defaultMembersOf === 'Group' ? SOURCE.students : SOURCE.groups,
  );

  const rowData = useMemo(() => {
    console.log('ManageMembersModalModal rowData memo', {
      providerList, studentList, itemData, groupList, membersOf,
    });
    if (tableDataSource === SOURCE.students)
      return studentList
        .filter((item) => Boolean(item.profile)) // remove invitations
        .map((item) => mapStudentMembersAgGridRows(item, itemData, orgState));
    if (tableDataSource === SOURCE.groups)
      return groupList.map((item) => mapGroupMembersAgGridRows(item, itemData, orgState));
    if (tableDataSource === SOURCE.teachers)
      return providerList
        .filter((item) => item.profile
          && item.profile.org.includes(`${orgState}_TEACHER`)) // filter out tutors and invitations
        .map((item) => mapProviderMembersAgGridRows(item, itemData, orgState));
    if (tableDataSource === SOURCE.tutors)
      return providerList
        .filter((item) => item.profile
          && item.profile.org.includes(`${orgState}_TEACHER`)) // filter out teachers and invitations
        .map((item) => mapProviderMembersAgGridRows(item, itemData, orgState));
    throw new Error(`ManageMembersModal modal tableDataSource not recognized: ${tableDataSource}`);
  }, [studentList, providerList, groupList, itemData, tableDataSource]);

  const columnDefs = useMemo(() => {
    if (tableDataSource === SOURCE.students)
      return generateStudentMembersAgGridColumns();
    // else group columns
    if (tableDataSource === SOURCE.groups)
      return generateGroupMembersAgGridColumns();
    if (tableDataSource === SOURCE.teachers)
      return generateProviderMembersAgGridColumns();
    if (tableDataSource === SOURCE.tutors)
      return generateProviderMembersAgGridColumns();
    throw new Error(`ManageMembersModal modal tableDataSource not recognized: ${tableDataSource}`);
  }, [tableDataSource]);

  useEffect(() => {
    // if no data, load data with page
    if (Object.keys(rowData).length < 1) {
      if (tableDataSource === SOURCE.students)
        getStudentData();
      if (tableDataSource === SOURCE.groups)
        getGroupData();
      if (tableDataSource === SOURCE.teachers)
        getProviderData();
      if (tableDataSource === SOURCE.tutors)
        getProviderData();
    }
  }, [rowData]);

  function close() {
    setTimeout(() => {
      toggleOpen(false);
    }, 100);
  }

  function toggleStudentIsMemberInGroup(cell) {
    let addMembers;
    let removeMembers;
    if (cell.value) // value true->false, remove
      removeMembers = [cell.data.id];
    else // false-> true, add
      addMembers = [cell.data.id];

    if (cell.data.invite === 'Sent')
      window.alert('A user must accept the invitation to your group before they can be assigned');
    else
      editMembersGroup({
        id: itemData.gid,
        addMembers,
        removeMembers,
      });
  }

  function toggleTeacherIsMemberInSession(cell) {
    let addMembers;
    let removeMembers;
    if (cell.value) // value true->false, remove
      removeMembers = [cell.data.id];
    else // false-> true, add
      addMembers = [cell.data.id];

    if (cell.data.invite === 'Sent')
      window.alert('A user must accept the invitation to your group before they can be assigned');
    else
      editMembersSession({
        id: itemData.sid,
        addMembers,
        removeMembers,
        areLeaders: true,
      });
  }

  function toggleTutorIsMemberInSession(cell) {
    window.alert(`
      Tutors cannot be switched from sessions. 
      Delete a session and reschedule to remove tutor.
    `);
  }

  function toggleGroupIsMemberInSession(cell) {
    console.log('cell click', itemData, cell);

    let addMembers;
    let removeMembers;
    const { activeMembers } = cell.data;
    if (cell.value) // value true->false, remove
      removeMembers = activeMembers;
    else // false-> true, add
      addMembers = activeMembers;

    editMembersSession({
      id: itemData.sid,
      addMembers,
      removeMembers,
    });
  }

  function handleToggleInclude(cell) {
    // handle backend call
    if (tableDataSource === SOURCE.students)
      toggleStudentIsMemberInGroup(cell);

    if (tableDataSource === SOURCE.groups)
      toggleGroupIsMemberInSession(cell);

    if (tableDataSource === SOURCE.teachers)
      toggleTeacherIsMemberInSession(cell);

    if (tableDataSource === SOURCE.tutors)
      toggleTutorIsMemberInSession(cell);

    /* deprecated as it's handled by page refresh/redux
    // toggle UI
    const rowNode = cell.node;
    rowNode.setDataValue('isIncluded', !cell.value);
    */
  }

  /**
   * handle cell button clicks
   * @param {object} cell clicked cell information
   */
  function handleCellClick(cell) {
    if (cell.colDef.headerName === 'Is Member?')
      console.log('ManageMembersModal row toggle', cell.data);
    else if (cell.colDef.headerName === 'Enrolled')
      handleToggleInclude(cell);
  }

  function handleGridReady(params) {
    setGridApi(params.api);
  }

  const rowConstants = {
    frameworkComponents: {
      checkbox: CustomCheckbox,
    },
    defaultColumnDefs: {
      resizable: true,
      minWidth: 100,
      filter: true,
      flex: 1,
      autoHeight: true,
    },
    defaultRowData: {
      autoHeight: true,
      resizable: true,
    },
  };

  function generateButtonBarForSession() {
    if (itemData.type === 'Classroom') // classroom has teachers
      return [[{
        text: 'Group',
        onClick: () => setTableDataSource(SOURCE.groups),
        icon: 'pe-7s-note2',
      }, {
        text: 'Teacher',
        onClick: () => setTableDataSource(SOURCE.teachers),
        icon: 'pe-7s-copy-file',
      }]];
    if (itemData.type === 'Classroom') // classroom has teachers
      return [[{
        text: 'Group',
        onClick: () => setTableDataSource(SOURCE.groups),
        icon: 'pe-7s-note2',
      }, {
        text: 'Tutor',
        onClick: () => setTableDataSource(SOURCE.tutors),
        icon: 'pe-7s-copy-file',
      }]];
    return [];
    // throw new Error(`generateButtonBarForSession item type not recognized: ${itemData.type}`);
  }

  const buttonGroups = (membersOf === 'Group') ? [[{
    text: 'Students',
    onClick: () => setTableDataSource(SOURCE.students),
    icon: 'pe-7s-note2',
  }]]
    : generateButtonBarForSession();

  return (
    <Modal
      show={isOpen}
      onHide={close}
      bsSize="large"
    >
      <Modal.Header closeButton style={{ textAlign: 'center' }}>
        <span>
          {itemData.name || itemData.info}
        </span>
        <span style={{ float: 'left' }}>
          {header}
        </span>
      </Modal.Header>
      <Modal.Body>
        <div>
          <p>{infoText}</p>
          <ButtonBar
            universalOptions={{ color: 'info' }}
            buttonGroups={buttonGroups}
          />
          <div
            className="ag-theme-alpine"
            style={{
              height: '70vh', width: '100%', maxWidth: '1500px', justifyContent: 'center',
            }}
          >
            {isLoading
              ? <Loader />
              : (
                <AgGridReact
                  animateRows
                  onGridReady={handleGridReady}
                  onCellClicked={handleCellClick}
                  frameworkComponents={rowConstants.frameworkComponents}
                  columnDefs={columnDefs.map(
                    (def) => ({ ...rowConstants.defaultColumnDefs, ...def }),
                  )}
                  rowData={rowData.map(
                    (def) => ({ ...rowConstants.defaultRowData, ...def }),
                  )}
                />
              )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="secondary" onClick={close}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

const mapStateToProps = ({
  userReducer, studentsReducer, groupsReducer, providersReducer, sessionsReducer,
}) => ({
  orgState: userReducer.org,
  studentList: studentsReducer.list,
  providerList: providersReducer.list,
  groupList: groupsReducer.list,
  isLoading: groupsReducer.loading || studentsReducer.loading
    || providersReducer.loading || sessionsReducer.loading,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getGroupData: () => dispatch(getGroupsThunk()),
  getStudentData: () => dispatch(getStudentsThunk()),
  getProviderData: () => dispatch(getProvidersThunk()),
  editMembersGroup: (data) => dispatch(editMembersGroupThunk(data)),
  editMembersSession: (data) => dispatch(editMembersSessionThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(ManageMembersModal);
