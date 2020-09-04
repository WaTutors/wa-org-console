import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import useWindowSize from 'services/useWindowSize';
import {
  mapProviderMainAgGridRows, generateProviderMainAgGridColumns,
} from 'services/parsers/provider.parser';
import {
  getProvidersThunk, inviteProvidersThunk, removeProviderThunk,
} from 'redux/ducks/provider.duck';
import TemplateList from './Template';

function ProviderList({
  // redux props go brrrrr
  getData, addData, removeData, // functions
  dataList, loading, orgState, orgReservedProps, // variables
  ...props
}) {
  console.log("LD --")
  console.log(orgState)
  console.log(dataList)
  console.log(orgReservedProps.provider)
  const { isMD } = useWindowSize();
  const rowData = useMemo(() => dataList.map(
    (item) => mapProviderMainAgGridRows(item, orgState, orgReservedProps.provider),
  ),
  [dataList]);

  // NOTE could leverage a redux prop if needed
  const columnDefs = useMemo(() => {
    console.log('calc columnDefs', { isMD });
    if (isMD) // full screen, filter nothing
      return generateProviderMainAgGridColumns([],orgReservedProps.provider);
      // if mobile, filter less important things
    return generateProviderMainAgGridColumns(['ratingCount', 'phone'],orgReservedProps.provider);
  }, [isMD]);

  return (
    <TemplateList
      listName="Tutor"
      props={props}
      isLoading={loading}
      getData={getData}
      addData={addData}
      removeRow={removeData}
      columnDefs={columnDefs}
      rowData={rowData}
      /* example rowData
        {invite: true,name: 'Tom Ng',phone: '+1 59333384448',completedSessions: 1,
        upcomingSessions: 0,rating: 3.5,ratingCount: 2,properties: ['Math 2'],
        invite: false,phone: '+1 25688484862',}
      */
      addForm={[{
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        bsClass: 'form-control',
        placeholder: '503 123 1234',
      }, {
        name: 'labels',
        label: 'Private Labels (period seperated)',
        type: 'string',
        placeholder: 'Grade 4. Reading. Yakima',
      }, {
        name: 'providerType',
        label: 'Type of Lesson Instructor',
        checkboxes: true,
        options: [{ label: 'Teacher', value: 'Teacher' }, { label: 'Tutor', value: 'Tutor' }],
      }]}
      processFile={(raw) => {
        const rows = raw.split('\n');
        return rows
          .slice(1) // remove header
          .map((row) => {
            const arr = row.split(',');
            return {
              phone: arr[0],
              labels: arr[1],
            };
          });
      }}
      exampleFilePath="https://firebasestorage.googleapis.com/v0/b/watutors-1.appspot.com/o/public%2Forg_example_csvs%2Ftutors.csv?alt=media&token=5b55d6a4-ae48-461b-8ae9-ea43970f25a5"
    />
  );
}

ProviderList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
  orgState: PropTypes.string.isRequired,
  orgReservedProps: PropTypes.array.isRequired,
};

const mapStateToProps = ({ userReducer, providersReducer }) => ({
  orgState: userReducer.org,
  orgReservedProps: userReducer.reservedProperties,
  loading: providersReducer.loading,
  dataList: providersReducer.list,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getProvidersThunk()),
  addData: (inputData) => dispatch(inviteProvidersThunk(inputData)),
  removeData: (data) => dispatch(removeProviderThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(ProviderList);
