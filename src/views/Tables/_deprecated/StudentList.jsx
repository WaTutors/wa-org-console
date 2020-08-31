/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  Grid, Row, Col, Table, Button, ButtonGroup,
} from 'react-bootstrap';
import DeleteButton from 'components/Buttons/DeleteButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import AddModal from 'components/Modals/AddModal';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import ButtonBar from 'components/Buttons/ButtonBar';

function StudentList(props) {
  const [gridApi, setGridApi] = useState(null);
  const [confirmText, setConfirmText] = useState();
  const [isAddOpen, setAddOpen] = useState();
  const toggleAddOpen = () => setAddOpen(!isAddOpen);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const toggleConfirmOpen = () => {
    console.log('confirm toggle');
    setConfirmOpen(!isConfirmOpen);
  };

  const [rowState, setRowState] = useState({
    frameworkComponents: {
      deleteButton: DeleteButton,
    },
    columnDefs: [{
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
    }],
    defaultColumnDefs: {
      resizable: true,
      filter: true,
      flex: 1,
      autoHeight: true,
    },
    rowData: [{
      invite: true, name: 'Tonya Harding', phone: '+1 59333384448', groupNum: 3, groups: ['Beginner Piano', 'Math 4', 'ESL'],
    }, {
      invite: true, name: 'Frank Floyd', phone: '+1 79388384645', groupNum: 2, groups: ['Math 2', 'ESL'],
    }, {
      invite: true, name: 'Edwardo Snow', phone: '+1 82688484862', groupNum: 0,
    }, {
      invite: true, name: 'Vlad Putin', phone: '+1 72688484862', groupNum: 0,
    }, {
      invite: true, name: 'Frank Ocean', phone: '+1 25688484862', groupNum: 1, groups: ['Intro to Building a website in less than a week'],
    },
    {
      invite: false, phone: '+1 25688484862',
    }],
    defaultRowData: {
      autoHeight: true,
      resizable: true,
      flex: 1,
    },
  });

  useEffect(() => {
    if (!gridApi)
      return; // abort if null

    if (!props.location.state || !props.location.state.filters)
      return;

    const { filters } = props.location.state;
    console.log('setting filters: ', filters);
    Object.keys(filters).forEach((filterKey) => {
      const filterComponent = gridApi.getFilterInstance(filterKey);
      if (filterComponent !== undefined) {
        filterComponent.setModel({
          type: 'contains',
          filter: filters[filterKey],
        });
        gridApi.onFilterChanged();
      }
    });
  }, [gridApi]);

  function handleGridReady(params) {
    console.log('StudentList passed filters:', props.location.state);
    setGridApi(params.api);
    // this.gridColumnApi = params.columnApi;
  }

  function handleConfirmRemove() { // confirm remove user
    window.alert('Remove not yet implemented');
  }

  function handleConfirmAdd() {
    window.alert('Add not yet implemented');
  }

  function handleCellClick(cell) {
    // console.log('cell click', cell.colDef.headerName, cell);
    if (cell.colDef.headerName === 'Remove') {
      setConfirmText(`Are you sure you want to remove ${cell.data.name || cell.data.phone} from your organization?`);
      setConfirmOpen(true);
    }
  }

  return (
    <div className="content">
      <ButtonBar
        universalOptions={{
          size: 'large',
          color: 'info',
        }}
        buttonGroups={[
          [{
            text: 'Refresh',
            onClick: () => window.location.reload(),
            icon: 'pe-7s-refresh-2',
          }],
          [{
            text: 'Add',
            onClick: () => setAddOpen(true),
            icon: 'pe-7s-add-user',
          }],
        ]}
      />
      <div className="ag-theme-alpine" style={{ height: '80vh', width: '100%', maxWidth: '1200px' }}>
        <AgGridReact
          animateRows
          onGridReady={handleGridReady}
          onCellClicked={handleCellClick}
          frameworkComponents={rowState.frameworkComponents}
          columnDefs={rowState.columnDefs.map(
            (def) => ({ ...rowState.defaultColumnDefs, ...def }),
          )}
          rowData={rowState.rowData.map(
            (def) => ({ ...rowState.defaultRowData, ...def }),
          )}
        />
      </div>
      <ConfirmModal
        onConfirm={handleConfirmRemove}
        isOpen={isConfirmOpen}
        toggleOpen={toggleConfirmOpen}
        text={confirmText}
        confirmTextCheck={false}
      />
      <AddModal
        onSubmit={handleConfirmAdd}
        isOpen={isAddOpen}
        toggleOpen={toggleAddOpen}
        header="Add Student(s) to Organization"
        infoText="Submitted profiles will be sent an invitation"
        form={[
          {
            name: 'phone',
            label: 'Phone Number',
            type: 'tel',
            bsClass: 'form-control',
            placeholder: '503 123 1234',
          },
        ]}
      />
    </div>
  );
}

export default StudentList;
