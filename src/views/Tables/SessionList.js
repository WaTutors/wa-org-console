import React, { useMemo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
  mapSessionMainAgGridRows, generateSessionMainAgGridColumns,
} from 'services/parsers/session.parser';
import {
  getSessionsThunk, createSessionsThunk, removeSessionThunk,
} from 'redux/ducks/session.duck';
import { getProvidersThunk } from 'redux/ducks/provider.duck';
import { getOrgSummaryThunk } from 'redux/ducks/user.duck';
import AddModal from 'components/Modals/AddModal';
import TemplateList from './Template';

function SessionList({
  // redux props go brrrrr
  getData, getProperties, addData, removeData, getProviders, // functions
  dataList, loading, properties, providerList, orgState, // variables
  ...props
}) {
  const [subjectAddFormFilter, setSubjectAddFormFilter] = useState('');
  const [isAddMultiOpen, setAddMultiOpen] = useState(false);
  const toggleMulti = () => setAddMultiOpen(!isAddMultiOpen);

  useEffect(() => {
    // if no data, load data with page
    if (Object.keys(providerList).length < 1)
      getProviders();
    if (!properties || properties.includes('Loading...'))
      getProperties();
  }, []);

  const rowData = useMemo(() => {
    if (dataList)
      return dataList.map(mapSessionMainAgGridRows);
    return [];
  }, [dataList]);

  const teacherList = useMemo(() => {
    console.log('SessionList subject filter', { subjectAddFormFilter });
    if (providerList)
      return providerList.map((item) => ({
        invite: item.profile ? 'Accepted' : 'Sent',
        name: item.profile ? item.profile.name.split('~')[0] : undefined,
        properties: item.profile ? item.profile.properties : null,
        instructorType: item.profile
          ? (item.profile.org.includes(`${orgState}_TEACHER`) && 'Teacher')
          || (item.profile.org.includes(`${orgState}_TUTOR`) && 'Tutor') || ''
          // if invitation
          : (item.labels.includes('TEACHER') && 'Teacher')
          || (item.labels.includes('TUTOR') && 'Tutor') || '',
        pid: item.pid,
      }))
        .filter((user) => user.invite === 'Accepted'
          && user.instructorType === 'Teacher'
          && (user.properties.includes(subjectAddFormFilter) || user.properties.includes(`${orgState}_${subjectAddFormFilter}`)));
    return [];
  }, [providerList, subjectAddFormFilter]);

  const addForm = useMemo(() => [{
    name: 'type',
    label: 'Session Type',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    options: [
      { label: 'Study Session', value: 'Study Session' },
      { label: 'Classroom', value: 'Classroom' },
    ],
  }, {
    name: 'startTime',
    label: 'Start Time',
    type: 'time',
    // placeholder: 'Study Session 34b',
  }, {
    name: 'startDate',
    label: 'Start Date',
    type: 'date',
    // placeholder: 'Study Session 34b',
  }, {
    name: 'name',
    label: 'Session Name',
    type: 'text',
    placeholder: 'Study Session 34b',
  }, {
    name: 'about',
    label: 'Session Description (about)',
    type: 'text',
    placeholder: 'This session will cover...',
  }, {
    name: 'subject',
    label: 'Session Subject',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    options: properties.map((item) => ({ value: item, label: item })),
  }, {
    name: 'provider',
    label: 'Select Teacher',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    options: teacherList.map((item) => ({ value: item, label: item.name })),
  }], [properties, teacherList]);

  const addFormMulti = useMemo(() => [{
    name: 'type',
    label: 'Session Type',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    options: [
      { label: 'Study Session', value: 'Study Session' },
      { label: 'Classroom', value: 'Classroom' },
    ],
  }, {
    name: 'startTime',
    label: 'Start Time',
    type: 'time',
  // placeholder: 'Study Session 34b',
  }, {
    name: 'dotw',
    label: 'Select days of the week',
    checkboxes: true,
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .map((dotw) => ({ label: dotw, value: dotw })),
  }, {
    name: 'startDay',
    label: 'First Possible Start Date',
    type: 'date',
  // placeholder: 'Study Session 34b',
  }, {
    name: 'endDay',
    label: 'Last Possible End Date',
    type: 'date',
  // placeholder: 'Study Session 34b',
  }, {
    name: 'name',
    label: 'Session Name',
    type: 'text',
    placeholder: 'Study Session 34b',
  }, {
    name: 'about',
    label: 'Session Description (about)',
    type: 'text',
    placeholder: 'This session will cover...',
  }, {
    name: 'subject',
    label: 'Session Subject',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    options: properties.map((item) => ({ value: item, label: item })),
  }, {
    name: 'provider',
    label: 'Select Teacher',
    type: 'select',
    componentClass: 'select',
    placeholder: 'select',
    options: teacherList.map((item) => ({ value: item, label: item.name })),
  }], [properties, teacherList]);

  // returns array of moments of days between days
  function enumerateDaysBetweenDates(startDate, endDate) {
    const currDate = moment(startDate).startOf('day');
    const lastDate = moment(endDate).startOf('day')
      .add(2, 'days'); // final day is on endDay

    const dates = [];
    while (currDate.add(1, 'days').diff(lastDate) < 0)
      dates.push(currDate.clone());
    return dates;
  }

  /**
   * process array of sessions based on time fields
   * then pass to thunk for creating sessions
   * @see enumerateDaysBetweenDates
   * @param {object} inputData data containing form data
   */
  function handleAddMulti(inputData) {
    const { startDay, endDay } = inputData;

    const startDate = new Date(startDay);
    const endDate = new Date(endDay);
    const dates = enumerateDaysBetweenDates(startDate, endDate);
    const newSessions = [];
    dates.forEach((dateMom) => {
      if (inputData[dateMom.format('dddd')]) { // inputData.Tuesday will be boolean
        const startDateStr = dateMom.format('YYYY-MM-DD');
        newSessions.push({
          ...inputData,
          startDate: startDateStr, // parsed in thunk
        });
      }
    });
    addData(newSessions);
  }

  /**
   * called on form change
   * returns a list of fields to dynamically hide
   * can be used for onFormChange like side-effects
   * @param {object} inputData data input field information
   * @returns {array} array of field names to hide
   */
  function handleFormChangeAndSetFieldInvisibility(inputData) {
    if (inputData.subject) // side-effect to filter provider by subject
      setSubjectAddFormFilter(inputData.subject);

    const hideFieldsArray = [];
    if (inputData.type === 'Study Session')
      return ['provider'];
    return hideFieldsArray;
  }

  return (
    <>
      <TemplateList
        listName="Session"
        manageMembersFor="Session"
        props={props}
        isLoading={loading}
        getData={getData}
        addData={addData}
        removeRow={removeData}
        columnDefs={generateSessionMainAgGridColumns()}
        rowData={rowData}
      // hideAddFile
        addInfo="Sessions are required to create sessions"
        addForm={addForm}
        processFile={(raw) => {
          const rows = raw.split('\n');
          return rows
            .slice(1) // remove header
            .map((row) => {
              const arr = row.split(',')
                .map((str) => str.trim());
              return {
                name: arr[0],
                about: arr[1],
                subject: arr[2],
                type: arr[3],
                startTime: arr[4],
                startDate: arr[5],
              };
            });
        }}
        formOnChangeSetFieldInvisibility={handleFormChangeAndSetFieldInvisibility}
        buttonBarExt={[[{
          text: 'Add Recuring',
          onClick: () => setAddMultiOpen(true),
          icon: 'pe-7s-photo-gallery',
        }]]}
        exampleFilePath="https://firebasestorage.googleapis.com/v0/b/watutors-1.appspot.com/o/public%2Forg_example_csvs%2Fsessions.csv?alt=media&token=6dae5126-0ac9-4ef8-b8c9-43e50801c32a"
      />
      <AddModal
        hideFile // if enabled: processFile={(raw) => window.alert('raw data: '+raw)}
        onSubmit={handleAddMulti}
        isOpen={isAddMultiOpen}
        toggleOpen={toggleMulti}
        header="Create Multiple Sessions within Organization"
        form={addFormMulti}
        onChangeSetFieldInvisibility={handleFormChangeAndSetFieldInvisibility}
      />
    </>
  );
}

SessionList.propTypes = {
  getData: PropTypes.func.isRequired,
  orgState: PropTypes.string.isRequired,
  addData: PropTypes.func.isRequired,
  removeData: PropTypes.func.isRequired,
  dataList: PropTypes.objectOf(PropTypes.any).isRequired,
  properties: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  getProviders: PropTypes.func.isRequired,
  providerList: PropTypes.objectOf(PropTypes.any).isRequired,
  getProperties: PropTypes.func.isRequired,
};

const mapStateToProps = ({
  userReducer, sessionsReducer, providersReducer,
}) => ({
  orgState: userReducer.org,
  dataList: sessionsReducer.list,
  properties: userReducer.properties,
  providerList: providersReducer.list,
  loading: sessionsReducer.loading && providersReducer.loading,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getProviders: () => dispatch(getProvidersThunk()),
  getData: () => dispatch(getSessionsThunk()),
  getProperties: () => dispatch(getOrgSummaryThunk()),
  addData: (data) => dispatch(createSessionsThunk(data)),
  removeData: (data) => dispatch(removeSessionThunk(data)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(SessionList);
