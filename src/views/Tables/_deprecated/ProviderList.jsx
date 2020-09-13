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

function ProviderList(props) {
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
      headerName: 'Contact (Phone or Email)', field: 'phone',
    }, {
      headerName: 'Complete Sessions', field: 'completedSessions', sortable: true, flex: 0.75, filter: 'agNumberColumnFilter',
    }, {
      headerName: 'Upcoming Sessions', field: 'upcomingSessions', sortable: true, flex: 0.75, filter: 'agNumberColumnFilter',
    }, {
      headerName: 'Rating', field: 'rating', flex: 0.75, filter: 'agNumberColumnFilter',
    }, {
      headerName: '# Ratings', field: 'ratingCount', flex: 0.75, filter: 'agNumberColumnFilter',
    }, {
      headerName: 'Subjects', field: 'properties', sortable: true, flex: 1.25,
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
      invite: true,
      name: 'Tom Ng',
      phone: '+1 59333384448',
      completedSessions: 1,
      upcomingSessions: 0,
      rating: 3.5,
      ratingCount: 2,
      properties: ['Math 2'],
    }, {
      invite: true,
      name: 'Brad Rlloyd',
      phone: '+1 79388384645',
      completedSessions: 12,
      upcomingSessions: 3,
      rating: 1.2,
      ratingCount: 5,
      properties: ['Math 2', 'ESL', 'Math 1', 'Math 3', 'Intro Spanish'],
    }, {
      invite: true,
      name: 'Zac Propp',
      phone: '+1 82688484862',
      completedSessions: 13,
      upcomingSessions: 3,
      rating: 3.6,
      ratingCount: 4,
      properties: ['Chemistry'],
    }, {
      invite: true,
      name: 'Elom Prutin',
      phone: '+1 72688484862',
      completedSessions: 25,
      upcomingSessions: 1,
      rating: 4.2,
      ratingCount: 6,
      properties: ['Math 3', 'ESL'],
    }, {
      invite: true,
      name: 'Hank Prop',
      phone: '+1 25688484862',
      completedSessions: 5,
      upcomingSessions: 0,
      rating: 4.2,
      ratingCount: 8,
      properties: ['Math 2', 'ESL'],
    },
    {
      invite: false,
      phone: '+1 25688484862',
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

export default ProviderList;
