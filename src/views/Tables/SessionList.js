import React, { useMemo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Button, Panel, Image } from 'react-bootstrap';

import {
  mapSessionMainAgGridRows, generateSessionMainAgGridColumns, getProviderAvatars,
} from 'services/parsers/session.parser';
import {
  getSessionsThunk, createSessionsThunk, removeSessionThunk, getAvailableSessionsThunk,
} from 'redux/ducks/session.duck';
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
      { label: 'Tutoring Session', value: 'Tutoring Session' },
      { label: 'Classroom', value: 'Classroom' },
    ],
  }, {
    name: 'startTime',
    label: 'Start Time',
    type: 'time',
    placeholder: 'HH:MM AA',
    help: 'Start Times must end with :00 or :30.',
    step: 1800,
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
                {availableSessions.map(({ provider: { pid, name, about }, id }) => {
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
                    </Panel>
                  );
                })}
              </>
            )
        )}
        addInfo="Sessions are required to create sessions" // FIXME lol what
        addForm={addForm}
        passInputData={setFormData}
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
          text: 'Add Recurring',
          onClick: () => setAddMultiOpen(true),
          icon: 'pe-7s-photo-gallery',
        }]]}
        exampleFilePath="https://firebasestorage.googleapis.com/v0/b/watutors-1.appspot.com/o/public%2Forg_example_csvs%2Fsessions.csv?alt=media&token=6dae5126-0ac9-4ef8-b8c9-43e50801c32a"
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
  addData: (data) => dispatch(createSessionsThunk(data)),
  removeData: (data) => dispatch(removeSessionThunk(data)),
  getAvailableSessions: (property, startDate, startTime) => dispatch(
    getAvailableSessionsThunk(property, startDate, startTime),
  ),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(SessionList);
