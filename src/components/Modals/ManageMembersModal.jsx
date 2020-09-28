/* eslint-disable no-use-before-define */
import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Button, Label, Input,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

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
import EditModal from 'components/Modals/EditModal';

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
  orgReservedProps: PropTypes.objectOf(PropTypes.any),
};

ManageMembersModal.defaultProps = {
  infoText: '',
  orgReservedProps: {},
};

const SOURCE = { students: 'students', teachers: 'teachers', groups: 'groups' };

function ManageMembersModal({
  header, infoText, orgState, defaultMembersOf,
  isOpen, toggleOpen,
  itemData, isLoading, studentList, groupList, providerList,
  getStudentData, getGroupData, getProviderData,
  editMembersGroup, editMembersSession,
  orgReservedProps,
}) {
  const [gridApi, setGridApi] = useState(null);
  const [membersOf, setMembersOf] = useState(defaultMembersOf);
  useEffect(() => { setMembersOf(defaultMembersOf); }, [defaultMembersOf]);
  const [tableDataSource, setTableDataSource] = useState(
    defaultMembersOf === 'Group' ? SOURCE.students : SOURCE.groups,
  );
  const [isRangeModalOpen, setRangeModalOpen] = useState(false);
  const toggleRangeModal = () => setRangeModalOpen(!isRangeModalOpen);

  const rowData = useMemo(() => {
    console.log('ManageMembersModalModal rowData memo', {
      providerList, studentList, itemData, groupList, membersOf,
    });
    if (!groupList)
      return [];
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
      return generateStudentMembersAgGridColumns([], orgReservedProps.consumer || null);
    // else group columns
    if (tableDataSource === SOURCE.groups)
      return generateGroupMembersAgGridColumns();
    if (tableDataSource === SOURCE.teachers)
      return generateProviderMembersAgGridColumns([], orgReservedProps.provider || null);
    if (tableDataSource === SOURCE.tutors)
      return generateProviderMembersAgGridColumns([], orgReservedProps.provider || null);
    throw new Error(`ManageMembersModal modal tableDataSource not recognized: ${tableDataSource}`);
  }, [tableDataSource]);

  useEffect(() => {
    // if no data, load data with page
    if (rowData && Object.keys(rowData).length < 1) {
      if (tableDataSource === SOURCE.students)
        getStudentData();
      if (tableDataSource === SOURCE.groups)
        getGroupData();
      if (tableDataSource === SOURCE.teachers)
        getProviderData();
      if (tableDataSource === SOURCE.tutors)
        getProviderData();
    }
  }, []);

  function close() {
    setTimeout(() => {
      toggleOpen(false);
    }, 100);
  }

  // will also accept agGrid row as argument
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

  // will also accept agGrid row as argument
  function toggleStudentIsMemberInGroupMulti(cells) {
    let addMembers;
    let removeMembers;
    if (cells[0].value) // value true->false, remove
      removeMembers = cells.map((cell) => cell.data.id);
    else // false-> true, add
      addMembers = cells.map((cell) => cell.data.id);

    editMembersGroup({
      id: itemData.gid,
      addMembers,
      removeMembers,
    });
  }

  // will also accept agGrid row as argument
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
      gid: cell.data.id, // update group link
      id: itemData.sid, // update document
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
  }

  function handleToggleIncludeMulti(cells) {
    // handle backend call
    if (tableDataSource === SOURCE.students)
      toggleStudentIsMemberInGroupMulti(cells);

    if (tableDataSource === SOURCE.groups)
      toast.error('-- Limit of one group per session --');

    if (tableDataSource === SOURCE.teachers)
      toast.error('-- Multiple teachers cannot be added --');

    if (tableDataSource === SOURCE.tutors)
      toast.error('-- Multiple tutors cannot be added --');
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

  function selectAllFiltered() {
    const nodeRows = [];
    gridApi.forEachNodeAfterFilter((node, index) => {
      console.log('filtered row', { node, index });
      nodeRows.push(node);
    });
    handleToggleIncludeMulti(nodeRows);
  }

  function handleSelectRange() {
    setRangeModalOpen(true);
  }

  function selectRange(form) {
    // parse and validate
    if (!form.first || !form.last)
      toast.error('-- Invalid Range: both must be specified --');
    const first = parseInt(form.first, 10) - 1; // base 1-indexed for humans
    const last = parseInt(form.last, 10) - 1;
    if (first >= last)
      toast.error('-- Invalid Range: first must be greater --');
    // execute logic
    setRangeModalOpen(false);
    const nodeRows = [];
    gridApi.forEachNodeAfterFilter((node, index) => {
      if (index >= first && index <= last) {
        console.log('filtered row', { node, index });
        nodeRows.push(node);
      }
    });
    handleToggleIncludeMulti(nodeRows);
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
          {defaultMembersOf === 'Group' && (
            <div style={{ overflow: 'hidden', marginBottom: '5px' }}>
              <Button
                style={{ float: 'right' }}
                onClick={selectAllFiltered}
              >
                Select All Visible
              </Button>
              <Button
                style={{ float: 'right' }}
                onClick={handleSelectRange}
              >
                Select Range
              </Button>
            </div>
          )}

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
                  enableCellTextSelection
                  onGridReady={handleGridReady}
                  onCellClicked={handleCellClick}
                  frameworkComponents={rowConstants.frameworkComponents}
                  columnDefs={columnDefs.map(
                    (def) => ({ ...rowConstants.defaultColumnDefs, ...def }),
                  )}
                  rowData={rowData.map(
                    (def) => ({ ...rowConstants.defaultRowData, ...def }),
                  ).sort((a, b) => (a.isIncluded && !b.isIncluded ? -1 : 1))} // included to top
                />
              )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="secondary" onClick={close}>Close</Button>
      </Modal.Footer>
      <EditModal
        onSubmit={selectRange}
        isOpen={isRangeModalOpen}
        toggleOpen={toggleRangeModal}
        header="Select Range of Rows"
        // infoText={'Start and end value'}
        form={[
          {
            name: 'first',
            label: 'First row to select',
            type: 'number',
            bsClass: 'form-control',
            placeholder: '3',
          },
          {
            name: 'last',
            label: 'Last row to select',
            type: 'number',
            bsClass: 'form-control',
            placeholder: '8',
          },
        ]}
      />
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
  orgReservedProps: userReducer.reservedLabels,
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
