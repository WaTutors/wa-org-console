/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DeleteUserButton from 'components/Buttons/DeleteUserButton';
import DeleteItemButton from 'components/Buttons/DeleteItemButton';
import EditButton from 'components/Buttons/EditButton';
import AddUserButton from 'components/Buttons/AddUserButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import AddModal from 'components/Modals/AddModal';
import ManageMembersModal from 'components/Modals/ManageMembersModal';
import EditModal from 'components/Modals/EditModal';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import '../../assets/sass/aggrid.scss';
import ButtonBar from 'components/Buttons/ButtonBar';
import Loader from 'components/Loader';
import populateFormInitialValues from 'services/parsers/editForm';
import SearchBar from 'components/FormInputs/SearchBar';

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
  editForm: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.string),
  ),
  hideAddFile: PropTypes.bool,
  addInfo: PropTypes.string,
  buttonBarExt: PropTypes.arrayOf(PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.any),
  )),
  manageMembersFor: PropTypes.oneOf(['Session', 'Group']),
  exampleFilePath: PropTypes.string,
  downloadName: PropTypes.string,
  formOnChangeSetFieldInvisibility: PropTypes.func,
  onEditSubmit: PropTypes.func,
};

TemplateList.defaultProps = {
  props: {},
  columnDefs: [{}],
  rowData: [{}],
  addForm: [{
    name: 'phone',
    label: 'Contact (Phone or Email)',
    type: 'tel',
    bsClass: 'form-control',
    placeholder: '503 123 1234',
  }],
  editForm: false,
  onEditSubmit: (e) => console.log('onEditSubmit default', e),
  hideAddFile: false,
  addInfo: 'Submitted profiles will be sent an invitation',
  downloadName: 'template.csv',
  buttonBarExt: [],
  manageMembersFor: 'Session',
  exampleFilePath: false,
  formOnChangeSetFieldInvisibility: () => [],
};

function TemplateList({
  props, listName, columnDefs, rowData, isLoading, addInfo, placeholder, controlId, addText, searchOptions,
  addForm, editForm, hideAddFile, buttonBarExt, manageMembersFor, org, properties, editHeader, editInfo, // vars
  exampleFilePath, downloadName, // vars cont
  getData, addData, removeRow, onEditSubmit, // callback functions
  formOnChangeSetFieldInvisibility, processFile, // passed forward functions
  addChildren, passInputData, // custom AddModal children
}) {
  const [selectedRow, selectRow] = useState({});
  const [gridApi, setGridApi] = useState(null);
  const [confirmText, setConfirmText] = useState();
  const [isAddOpen, setAddOpen] = useState();
  const toggleAddOpen = () => setAddOpen(!isAddOpen);
  const [isManageOpen, setManageOpen] = useState();
  const toggleManageOpen = () => setManageOpen(!isManageOpen);
  const [isEditOpen, setEditOpen] = useState();
  const toggleEditOpen = () => setEditOpen(!isEditOpen);
  const [editFormParsed, setEditFormParsed] = useState(editForm);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [optionFilter, setOptionFilter] = useState(searchOptions ? searchOptions[0].value : '');

  const toggleConfirmOpen = () => {
    console.log('confirm toggle');
    setConfirmOpen(!isConfirmOpen);
  };

  // if no data, load data with page
  useEffect(() => {
    if (rowData && Object.keys(rowData).length < 1) {
      console.log('Template', rowData);
      getData();
    }
  }, []);

  // update EditForm
  useEffect(() => {
    const parsedForm = populateFormInitialValues(editForm, selectedRow, org, properties);
    console.log({ parsedForm });
    setEditFormParsed(parsedForm);
  }, [editForm, selectedRow]);

  // update selected row ui on data change
  useEffect(() => {
    rowData.forEach((row) => {
      if (row.id === selectedRow.id)
        selectRow(row);
    });
  }, [rowData]);

  useEffect(() => {
    if (gridApi)
      if (!search) {
        gridApi.setFilterModel(null);
      } else if (searchOptions) {
        const filterComponent = gridApi.getFilterInstance(optionFilter);

        if (filterComponent) {
          filterComponent.setModel({
            type: 'contains',
            filter: search,
          });

          gridApi.onFilterChanged();
        }
      } else if (/^[a-zA-Z]+$/.test(search)) {
        const filterComponent = gridApi.getFilterInstance('name');

        if (filterComponent) {
          filterComponent.setModel({
            type: 'contains',
            filter: search,
          });

          gridApi.onFilterChanged();
        }
      } else {
        const filterComponent = gridApi.getFilterInstance('phone');

        if (filterComponent) {
          filterComponent.setModel({
            type: 'contains',
            filter: search,
          });

          gridApi.onFilterChanged();
        }
      }
  }, [gridApi, optionFilter, search]);

  function handleGridReady(params) {
    console.log('TemplateList passed filters:', props.location.state);
    setGridApi(params.api);
    // this.gridColumnApi = params.columnApi;
  }

  function handleEditSubmit(data) {
    if (controlId === 'propertySearch')
      onEditSubmit(selectedRow);
    else
      onEditSubmit({ pid: selectedRow.pid, ...data });
  }

  function handleConfirmRemove() { // confirm remove user
    console.log('onRemove', selectedRow);
    removeRow(selectedRow);
  }

  function handleConfirmAdd(inputData) {
    return addData(inputData);
  }

  function handleRefresh() {
    getData();
  }

  /**
   * handle cell button clicks
   * @param {object} cell clicked cell information
   */
  function handleCellClick(cell) {
    // console.log('cell click', cell.colDef.headerName, cell);
    if (cell.colDef.headerName === 'Remove'
      || cell.colDef.headerName === 'Delete') {
      selectRow(cell.data);
      setConfirmText(`Are you sure you want to remove ${cell.data.name || cell.data.phone || 'this'} from your organization?`);
      setConfirmOpen(true);
    } else if (cell.colDef.headerName === 'Manage') {
      selectRow(cell.data);
      setManageOpen(true);
    } else if (cell.colDef.headerName === 'Edit'
      && (cell.data.invite === 'Accepted' || !cell.data.invite)) {
      selectRow(cell.data);
      setEditOpen(true);
    }
  }

  const rowConstants = {
    frameworkComponents: {
      deleteButton: DeleteUserButton,
      deleteItem: DeleteItemButton,
      addUserButton: AddUserButton,
      editButton: EditButton,
    },
    defaultColumnDefs: {
      resizable: true,
      minWidth: 100,
      filter: true,
      flex: 1,
      sortable: true,
      autoHeight: true,
    },
    defaultRowData: {
      autoHeight: true,
      resizable: true,
    },
  };

  return (
    <div className="content" style={{ backgroundColor: '#f4f4f4' }}>
      <SearchBar
        addText={addText}
        controlId={controlId}
        onAdd={() => setAddOpen(true)}
        onRefresh={handleRefresh}
        options={searchOptions}
        placeholder={placeholder}
        setOptionFilter={setOptionFilter}
        setSearch={setSearch}
      />
      <div
        className={isLoading ? undefined : 'ag-theme-alpine'}
        style={{
          height: '61vh', width: '100%', justifyContent: 'center',
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
        onChangeSetFieldInvisibility={formOnChangeSetFieldInvisibility}
        hideFile={hideAddFile}
        processFile={processFile}
        downloadName={downloadName}
        exampleFilePath={exampleFilePath}
        passInputData={passInputData}
      >
        {addChildren}
      </AddModal>
      <ManageMembersModal
        isOpen={isManageOpen}
        toggleOpen={toggleManageOpen}
        itemData={selectedRow}
        header={`Manage Users in ${listName}`}
        defaultMembersOf={manageMembersFor}
        rowData
      />
      {editForm && (
        <EditModal
          header={editHeader}
          info={editInfo}
          isOpen={isEditOpen}
          toggleOpen={toggleEditOpen}
          onSubmit={handleEditSubmit}
          form={editFormParsed}
        />
      )}
    </div>
  );
}

export default TemplateList;
