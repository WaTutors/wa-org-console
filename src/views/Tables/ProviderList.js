import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  getProvidersThunk, inviteProvidersThunk, removeProviderThunk,
} from 'redux/ducks/provider.duck';
import TemplateList from './Template';

function ProviderList({
  // redux props go brrrrr
  getData, addData, removeData, // functions
  dataList, loading, // variables
  ...props
}) {
  const rowData = useMemo(() => dataList.map((item) => ({
    invite: Boolean(item.profile),
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: item.profile ? item.phone : item.to,
    rating: item.rating,
    ratingCount: item.numRating,
    properties: item.profile.properties,
    iid: item.iid,
    pid: item.pid,
  })), [dataList]);

  return (
    <TemplateList
      listName="Tutor"
      props={props}
      isLoading={loading}
      getData={getData}
      addData={addData}
      removeRow={removeData}
      columnDefs={[
        { headerName: 'Active', field: 'invite', flex: 0.5 },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Phone Number', field: 'phone' },
        {
          headerName: 'Rating', field: 'rating', flex: 0.75, filter: 'agNumberColumnFilter',
        },
        {
          headerName: '# Ratings', field: 'ratingCount', flex: 0.75, filter: 'agNumberColumnFilter',
        },
        {
          headerName: 'Subjects', field: 'properties', sortable: true, flex: 1.25,
        },
        {
          headerName: 'Remove', cellRenderer: 'deleteButton', width: '64px', flex: 0.5,
        },
        /* removed columns
        {headerName: 'Upcoming Sessions', field: 'upcomingSessions', sortable: true,
            flex: 0.75, filter: 'agNumberColumnFilter'},
        {headerName: 'Complete Sessions', field: 'completedSessions', sortable: true,
            flex: 0.75, filter: 'agNumberColumnFilter'},
        */
      ]}
      rowData={rowData}
      /* example
      rowData={[{
        invite: true,name: 'Tom Ng',phone: '+1 59333384448',completedSessions: 1,
        upcomingSessions: 0,rating: 3.5,ratingCount: 2,properties: ['Math 2'],
      },{
        invite: false,phone: '+1 25688484862',
      }]}
      */
    />
  );
}

ProviderList.propTypes = {
  getData: PropTypes.func.isRequired,
  addData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ userReducer, providersReducer }) => ({
  orgState: userReducer.org,
  loading: providersReducer.loading,
  dataList: providersReducer.list,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getProvidersThunk()),
  addData: (inputData) => dispatch(inviteProvidersThunk(inputData.phone)),
  removeData: (data) => dispatch(removeProviderThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(ProviderList);
