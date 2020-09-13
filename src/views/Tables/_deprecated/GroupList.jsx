import React, { useState } from 'react';
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

function GroupList() {
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
      headerName: 'Subject', field: 'name',
    }, {
      headerName: '# Members', field: 'phone',
    }, {
      headerName: 'Members', field: 'completedSessions', sortable: true, flex: 0.75, filter: 'agNumberColumnFilter',
    }, {
      headerName: 'Upcoming Sessions', field: 'upcomingSessions', sortable: true, flex: 0.75, filter: 'agNumberColumnFilter',
    }, {
      headerName: 'Remove', cellRenderer: 'deleteButton', width: '64px', flex: 0.5,
    }],
    defaultColumnDefs: {
      resizable: true,
      filter: true,
      flex: 1,
      autoHeight: true,
    },
    rowData: [],
    defaultRowData: {
      autoHeight: true,
      resizable: true,
      flex: 1,
    },
  });

  function handleConfirmRemove() { // confirm remove user
    window.alert('Remove not yet implemented');
  }

  function handleConfirmAdd() {
    window.alert('Add group coming soon');
  }

  function handleCellClick(cell) {
    // console.log('cell click', cell.colDef.headerName, cell);
    if (cell.colDef.headerName === 'Remove') {
      setConfirmText('Are you sure you want to remove this group from your organization?');
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
        header="Add Tutor(s) to Organization"
        infoText="Submitted profiles will be sent an invitation"
        form={[
          {
            name: 'phone',
            label: 'Contact (Phone or Email)',
            bsClass: 'form-control',
            placeholder: '503 123 1234',
          },
        ]}
      />
    </div>
  );
}

export default GroupList;
