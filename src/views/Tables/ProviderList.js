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
  dataList, loading, orgState, // variables
  ...props
}) {
  const rowData = useMemo(() => dataList.map((item) => ({
    invite: item.profile ? 'Accepted' : 'Sent',
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: item.profile ? item.phone : item.to,
    rating: item.rating,
    ratingCount: item.numRating,
    properties: item.profile ? item.profile.properties : null,
    instructorType: item.profile
      ? (item.profile.org.includes(`${orgState}_TEACHER`) && 'Teacher')
    || (item.profile.org.includes(`${orgState}_TUTOR`) && 'Tutor') || ''
    // if invitation
      : (item.labels.includes('TEACHER') && 'Teacher')
    || (item.labels.includes('TUTOR') && 'Tutor') || '',
    labels: item.profile
      ? item.profile.org
        .filter((str) => str.includes(orgState) && str !== orgState
          && !str.includes('TEACHER') && !str.includes('TUTOR'))
        .map((str) => str.replace(`${orgState}_`, ''))
      // if invitation
      : item.labels
        .filter((str) => str !== 'TEACHER' && str !== 'TUTOR'),
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
      columnDefs={[{
        headerName: 'Invite', field: 'invite', flex: 0.5,
      }, {
        headerName: 'Name', field: 'name',
      }, {
        headerName: 'Role', field: 'instructorType',
      }, {
        headerName: 'Labels', field: 'labels', flex: 1.25,
      }, {
        headerName: 'Phone Number', field: 'phone',
      }, {
        headerName: 'Rating', field: 'rating', flex: 0.75, filter: 'agNumberColumnFilter',
      }, {
        headerName: '# Ratings', field: 'ratingCount', flex: 0.75, filter: 'agNumberColumnFilter',
      }, {
        headerName: 'Subjects', field: 'properties', sortable: true, flex: 1.25,
      }, {
        headerName: 'Remove', cellRenderer: 'deleteButton', width: 64,
      },
        /* removed columns
        {headerName: 'Upcoming Sessions', field: 'upcomingSessions', sortable: true,
            flex: 0.75, filter: 'agNumberColumnFilter'},
        {headerName: 'Complete Sessions', field: 'completedSessions', sortable: true,
            flex: 0.75, filter: 'agNumberColumnFilter'},
        */
      ]}
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
        placeholder: '+1 5031231234',
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
};

const mapStateToProps = ({ userReducer, providersReducer }) => ({
  orgState: userReducer.org,
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
