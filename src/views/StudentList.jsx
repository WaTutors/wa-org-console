import React, { useState } from 'react';
import {
  Grid, Row, Col, Table, Button, ButtonGroup,
} from 'react-bootstrap';
import DeleteButton from 'components/Buttons/DeleteButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import ButtonBar from 'components/Buttons/ButtonBar';

function StudentList() {
  const [confirmText, setConfirmText] = useState();
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
      headerName: 'Name', field: 'name',
    }, {
      headerName: 'Phone Number', field: 'phone',
    }, {
      headerName: 'Number of Groups', field: 'groups', sortable: true,
    }, {
      headerName: 'Delete', cellRenderer: 'deleteButton', width: '64px', flex: 0.5,
    }],
    defaultColumnDefs: {
      resizable: true,
      filter: true,
      flex: 1,
      autoHeight: true,
    },
    rowData: [{
      name: 'Tonya Harding', phone: '+1 59333384448', groups: 6,
    }, {
      name: 'Frank Floyd', phone: '+1 79388384645', groups: 3,
    }, {
      name: 'Edwardo Snow', phone: '+1 82688484862', groups: 0,
    }, {
      name: 'Vlad Putin', phone: '+1 72688484862', groups: 0,
    }, {
      name: 'Frank Ocean', phone: '+1 25688484862', groups: 7,
    }],
    defaultRowData: {
      autoHeight: true,
      resizable: true,
      flex: 1,
    },
  });

  function handleConfirm() { // confirm remove user
    window.alert('Remove not yet implemented');
  }

  function handleCellClick(cell) {
    // console.log('cell click', cell.colDef.headerName, cell);
    if (cell.colDef.headerName === 'Delete') {
      setConfirmText(`Are you sure you want to remove ${cell.data.name} from your organization?`);
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
            onClick: () => console.log('hello there'),
            icon: 'pe-7s-refresh-2',
          }],
          [{
            text: 'Add',
            onClick: () => console.log('add there'),
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
        onConfirm={handleConfirm}
        isOpen={isConfirmOpen}
        toggleOpen={toggleConfirmOpen}
        text={confirmText}
        confirmTextCheck={false}
      />
    </div>
  );
}

export default StudentList;
