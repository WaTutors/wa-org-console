import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import useWindowSize from 'services/useWindowSize';
import {
  mapProviderMainAgGridRows, generateProviderMainAgGridColumns,
} from 'services/parsers/provider.parser';
import {
  getProvidersThunk, inviteProvidersThunk, removeProviderThunk, editProviderThunk,
} from 'redux/ducks/provider.duck';
import TemplateList from './Template';

function ProviderList({
  // redux props go brrrrr
  getData, addData, removeData, editData, // functions
  dataList, properties, loading, orgState, orgReservedProps, // variables
  ...props
}) {
  const providerProps = (orgReservedProps && orgReservedProps.provider) || null;
  const { isMD } = useWindowSize();
  const rowData = useMemo(() => dataList.map(
    (item) => mapProviderMainAgGridRows(item, orgState, providerProps),
  ),
  [dataList]);

  // NOTE could leverage a redux prop if needed
  const columnDefs = useMemo(() => {
    console.log('calc columnDefs', { isMD });
    if (isMD) // full screen, filter nothing
      return generateProviderMainAgGridColumns(
        orgState === 'watutor_default' ? ['invite'] : ['org'],
        providerProps,
      );
      // if mobile, filter less important things
    return generateProviderMainAgGridColumns(
      orgState === 'watutor_default'
        ? ['ratingCount', 'phone', 'invite']
        : ['ratingCount', 'phone', 'org'],
      providerProps,
    );
  }, [isMD]);

  const form = [{
    name: 'phone',
    csvlabel: 'Contact (Phone or Email)',
    label: 'Contact (Phone or Email)',
    bsClass: 'form-control',
    placeholder: '503 123 1234',
  }, /* {
    name: 'labels',
    csvlabel: 'Additional Labels',
    label: 'Private Labels (period seperated)',
    type: 'string',
    placeholder: 'Grade 4. Reading. Yakima',
  } */];

  if (providerProps)
    Object.entries(providerProps).forEach(([key, value]) => {
      if (Array.isArray(value))
        if (value.length > 0)
          form.push({
            name: key,
            label: key,
            csvlabel: key,
            componentClass: 'select',
            placeholder: 'select',
            options: value && value.map((item) => ({ value: item, label: item })),
          });
        else
          form.push({
            name: key,
            label: key,
            csvlabel: key,
            checkboxes: true,
            options: value && value.map((item) => ({ value: item, label: item })),
          });
      else if (value === 'TEXT')
        form.push({
          name: key,
          label: key,
          csvlabel: key,
          type: 'string',
          placeholder: 'Text here',
        });
    });

  const editForm = [{
    name: 'properties',
    label: 'Assigned Subjects (for tutoring)',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    multi: true,
    options: properties && properties.map((item) => ({ value: item, label: item })),
  }];

  function handleEditSubmit(e) {
    console.log('ProviderList handleEditSubmit', e);
    if (e.properties && e.properties.length > 0)
      editData(e);
  }

  const csvContent = `data:text/csv;charset=utf-8, ${form.map((item) => item.csvlabel).join(',')}\n`;
  const encodedUri = encodeURI(csvContent);

  return (
    <TemplateList
      addText="Add instructor"
      controlId="providerSearch"
      listName="Tutor"
      props={props}
      org={orgState}
      properties={properties}
      isLoading={loading}
      getData={getData}
      addData={addData}
      removeRow={removeData}
      columnDefs={columnDefs}
      downloadName={`add_instructor_${orgState}.csv`}
      rowData={rowData}
      /* example rowData
        {invite: true,name: 'Tom Ng',phone: '+1 59333384448',completedSessions: 1,
        upcomingSessions: 0,rating: 3.5,ratingCount: 2,properties: ['Math 2'],
        invite: false,phone: '+1 25688484862',}
      */
      addForm={form}
      editForm={editForm}
      onEditSubmit={handleEditSubmit}
      placeholder="Search by name or phone number..."
      processFile={(raw) => {
        const rows = raw.split('\n');
        const validRows = rows.filter((row) => row !== '');
        return validRows
          .slice(1) // remove header
          .map((row) => {
            const arr = row.split(',');
            const csvCols = form.map((item) => item.name);
            // console.log('provider processFile', { csvCols, arr });
            return csvCols
              .reduce((obj, key, i) => { //
                console.log({ res: form[i] });
                const freeTextPrefix = form[i].type === 'string'
                  ? `${key}_`
                  : ''; // for freeform'
                return { ...obj, [key]: freeTextPrefix + arr[i] };
              }, { fromParseFile: true });
          });
      }}
      exampleFilePath={encodedUri}
    />
  );
}

ProviderList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  editData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  properties: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  orgState: PropTypes.string.isRequired,
  orgReservedProps: PropTypes.arrayOf(PropTypes.any).isRequired,
};

const mapStateToProps = ({ userReducer, providersReducer }) => ({
  orgState: userReducer.org,
  orgReservedProps: userReducer.reservedLabels,
  loading: providersReducer.loading,
  dataList: providersReducer.list,
  properties: userReducer.properties,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getProvidersThunk()),
  addData: (inputData) => dispatch(inviteProvidersThunk(inputData)),
  removeData: (data) => dispatch(removeProviderThunk(data)),
  editData: (payload) => dispatch(editProviderThunk(payload)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(ProviderList);
