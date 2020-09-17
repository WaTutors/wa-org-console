import React, { useMemo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Button, Panel, Image } from 'react-bootstrap';

import {
  mapSessionMainAgGridRows, generateSessionMainAgGridColumns, getProviderAvatars, parseSessionTime,
} from 'services/parsers/session.parser';
import {
  getSessionsThunk, createSessionsThunk, removeSessionThunk, getAvailableSessionsThunk,
} from 'redux/ducks/session.duck';
import AddModal from 'components/Modals/AddModal';
import { getProvidersThunk } from 'redux/ducks/provider.duck';
import { getOrgSummaryThunk } from 'redux/ducks/user.duck';
import Loader from 'components/Loader';
import TemplateList from './Template';

function SessionList({
  // redux props go brrrrr
  getData, getProperties, addData, removeData, getProviders, getAvailableSessions, // functions
  dataList, loading, properties, providerList, orgState, availableSessions, // variables
  ...props
}) {
  const [subjectAddFormFilter, setSubjectAddFormFilter] = useState('');
  const [isAddMultiOpen, setAddMultiOpen] = useState(false);
  const toggleMulti = () => setAddMultiOpen(!isAddMultiOpen);
  const [isLoadingAvailable, setLoadingAvailable] = useState(false);
  const [formData, setFormData] = useState({});
  const [providerAvatars, setProviderAvatars] = useState({});
  const [selectedSession, selectSession] = useState(null);

  useEffect(() => {
    // if no data, load data with page
    if (Object.keys(providerList).length < 1)
      getProviders();
    if (!properties || properties.includes('Loading...'))
      getProperties();
  }, []);

  useEffect(() => {
    if (availableSessions.length > 0)
      getProviderAvatars(availableSessions.map(({ provider: { pid } }) => pid))
        .then((avatars) => {
          setProviderAvatars(avatars);
        });
  }, [availableSessions]);

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
        .filter((user) => user.invite === 'Accepted');
    // && user.instructorType === 'Teacher');
    // && (user.properties.includes(subjectAddFormFilter) || user.properties.includes(`${orgState}_${subjectAddFormFilter}`)));
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
      { label: 'Tutoring Session', value: 'Tutoring Session' },
      { label: 'Classroom', value: 'Classroom' },
    ],
  }, {
    name: 'startTime',
    label: 'Start Time',
    type: 'time',
    placeholder: 'HH:MM AA',
  }, {
    name: 'startDate',
    label: 'Start Date',
    type: 'date',
    placeholder: 'YYYY-MM-DD',
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
    name: 'tutor',
    label: 'Select Tutor',
    type: 'search',
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
    name: 'tutor',
    label: 'Select Tutor',
    type: 'search',
  }, {
    name: 'provider',
    label: 'Select Teacher',
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
    return addData(newSessions);
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

    if (inputData.type !== 'Classroom')
      hideFieldsArray.push('provider');

    if (inputData.type !== 'Tutoring Session')
      hideFieldsArray.push('tutor');

    if (inputData.type === 'Tutoring Session')
      hideFieldsArray.push('name', 'about', 'startTime', 'startDate');

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
        addData={(data) => addData(
          data,
          selectedSession
            ? availableSessions.find((session) => session.id === selectedSession)
            : null,
        )}
        removeRow={removeData}
        columnDefs={generateSessionMainAgGridColumns()}
        rowData={rowData}
        // hideAddFile
        addChildren={formData.type === 'Tutoring Session' && (
          isLoadingAvailable
            ? <Loader />
            : (
              <>
                <Button
                  bsStyle="info"
                  onClick={() => {
                    setLoadingAvailable(true);
                    getAvailableSessions(formData.subject, formData.startDate, formData.startTime)
                      .then(() => setLoadingAvailable(false));
                  }}
                  className="btn-fill"
                  style={{ marginBottom: 10 }}
                >
                  <i className="pe-7s-search" />
                  {' '}
                  Search
                </Button>
                <br />
                {availableSessions.map((
                  { provider: { pid, name, about }, id, info: { start: { _seconds } } },
                ) => {
                  const selected = selectedSession === id;

                  return (
                    <Panel
                      key={id}
                      bsStyle={selected ? 'info' : undefined}
                      onClick={() => {
                        if (selected)
                          selectSession(null);
                        else
                          selectSession(id);
                      }}
                      style={{
                        marginTop: 10,
                        padding: 10,
                        display: 'inline-block',
                        marginRight: 10,
                      }}
                    >
                      <div style={{
                        overflow: 'hidden',
                        height: 75,
                        width: 75,
                        borderRadius: 37.5,
                        margin: 'auto',
                      }}
                      >
                        <Image
                          src={providerAvatars[pid]}
                          responsive
                          style={{
                            width: 'auto',
                            height: 75,
                            alignSelf: 'center',
                            backgroundColor: 'gray',
                          }}
                        />
                      </div>
                      <h5 style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {name.slice(0, -2)}
                      </h5>
                      <p style={{
                        fontSize: 14, color: 'gray', maxWidth: 150, textAlign: 'center',
                      }}
                      >
                        {about}
                      </p>
                      <h5 style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {parseSessionTime(_seconds * 1000)}
                      </h5>
                    </Panel>
                  );
                })}
              </>
            )
        )}
        addInfo="Create a sessions to create a time for a video call and invite users"
        addForm={addForm}
        passInputData={setFormData}
        processFile={(raw) => {
          const rows = raw.split('\n');
          const validRows = rows.filter((row) => row !== '');
          return validRows
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
          text: 'Add Recurring',
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
  getAvailableSessions: PropTypes.func.isRequired,
  availableSessions: PropTypes.arrayOf(PropTypes.shape({

  })).isRequired,
};

const mapStateToProps = ({
  userReducer, sessionsReducer, providersReducer,
}) => ({
  orgState: userReducer.org,
  dataList: sessionsReducer.list,
  properties: userReducer.properties,
  providerList: providersReducer.list,
  loading: sessionsReducer.loading && providersReducer.loading,
  availableSessions: sessionsReducer.availableSessions,
});
const mapDispatchToProps = (dispatch) => ({
  getProviders: () => dispatch(getProvidersThunk()),
  getData: () => dispatch(getSessionsThunk()),
  getProperties: () => dispatch(getOrgSummaryThunk()),
  addData: (data, selectedSession) => dispatch(createSessionsThunk(data, selectedSession)),
  removeData: (data) => dispatch(removeSessionThunk(data)),
  getAvailableSessions: (property, startDate, startTime) => dispatch(
    getAvailableSessionsThunk(property, startDate, startTime),
  ),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(SessionList);
