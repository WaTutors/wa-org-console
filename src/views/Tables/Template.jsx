/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DeleteButton from 'components/Buttons/DeleteButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import AddModal from 'components/Modals/AddModal';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { Grid } from 'react-bootstrap';
import ButtonBar from 'components/Buttons/ButtonBar';
import Loader from 'components/Loader';

TemplateList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  props: PropTypes.any,
  columnDefs: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.any),
  ),
  rowData: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.any),
  ),
  listName: PropTypes.string.isRequired,
  getData: PropTypes.func.isRequired,
  addForm: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.string),
  ),
  hideAddFile: PropTypes.bool,
  addInfo: PropTypes.string,
};

TemplateList.defaultProps = {
  props: {},
  columnDefs: [{}],
  rowData: [{}],
  addForm: [{
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    bsClass: 'form-control',
    placeholder: '+1 5031231234',
  }],
  hideAddFile: false,
  addInfo: 'Submitted profiles will be sent an invitation',
};

function TemplateList({
  props, listName, columnDefs, rowData, isLoading, addInfo, addForm, hideAddFile,
  getData, addData, removeRow, // callback functions
}) {
  const [selectedRow, selectRow] = useState({});
  const [gridApi, setGridApi] = useState(null);
  const [confirmText, setConfirmText] = useState();
  const [isAddOpen, setAddOpen] = useState();
  const toggleAddOpen = () => setAddOpen(!isAddOpen);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const toggleConfirmOpen = () => {
    console.log('confirm toggle');
    setConfirmOpen(!isConfirmOpen);
  };

  useEffect(() => {
    // if no data, load data with page
    if (Object.keys(rowData).length < 1)
      getData();
  }, []);

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
    console.log('TemplateList passed filters:', props.location.state);
    setGridApi(params.api);
    // this.gridColumnApi = params.columnApi;
  }

  function handleConfirmRemove() { // confirm remove user
    console.log('onRemove', selectedRow);
    removeRow(selectedRow);
  }

  function handleConfirmAdd(inputData) {
    addData(inputData);
  }

  function handleRefresh() {
    getData();
  }

  function handleCellClick(cell) {
    // console.log('cell click', cell.colDef.headerName, cell);
    if (cell.colDef.headerName === 'Remove') {
      selectRow(cell.data);
      setConfirmText(`Are you sure you want to remove ${cell.data.name || cell.data.phone} from your organization?`);
      setConfirmOpen(true);
    }
  }

  const rowConstants = {
    frameworkComponents: {
      deleteButton: DeleteButton,
    },
    defaultColumnDefs: {
      resizable: true,
      minWidth: 75,
      filter: true,
      flex: 1,
      autoHeight: true,
    },
    defaultRowData: {
      autoHeight: true,
      resizable: true,
      flex: 1,
    },
  };

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
            onClick: handleRefresh,
            icon: 'pe-7s-refresh-2',
          }],
          [{
            text: 'Add',
            onClick: () => setAddOpen(true),
            icon: 'pe-7s-add-user',
          }],
        ]}
      />
      <div
        className="ag-theme-alpine"
        style={{
          height: '80vh', width: '100%', maxWidth: '1200px', justifyContent: 'center',
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
        header={`Add ${listName}(s) to Organization`}
        infoText={addInfo}
        form={addForm}
        hideFile={hideAddFile}
      />
    </div>
  );
}

export default TemplateList;
