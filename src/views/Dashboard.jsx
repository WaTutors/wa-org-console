/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or
* substantial portions of the Software.

*/
import React, { useEffect, useState } from 'react';
import ChartistGraph from 'react-chartist';
import {
  Grid, Row, Col, Button,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';

import moment from 'moment';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import ChevronRight from '@material-ui/icons/ChevronRight';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';

import { Card } from 'components/Cards/Card';
import { StatsCard } from 'components/Cards/StatsCard';
import OrgGroupLabels from 'components/Cards/GroupLabels';
import { responsiveSales } from 'variables/Variables';
import { getProvidersThunk } from 'redux/ducks/provider.duck';
import { getStudentsThunk } from 'redux/ducks/student.duck';
import { getOrgSummaryThunk } from 'redux/ducks/user.duck';
import SimulationModal from 'components/Modals/SimulationModal';
import { getAnalyticsThunk } from 'redux/ducks/analytics.duck';
import Loader from 'components/Loader';

const animatedComponents = makeAnimated();

const PrimarySwitch = withStyles({
  switchBase: {
    color: '#3478f6',
    '&$checked': {
      color: '#3478f6',
    },
    '&$checked + $track': {
      backgroundColor: '#3478f6',
    },
  },
  checked: {},
  track: {},
})(Switch);

const LargeFormControlLabel = withStyles({
  label: {
    fontSize: 14,
  },
})(FormControlLabel);

function Dashboard({
  alias, getProviders, providers, getStudents, students, orgState, getOrgSummary, getAnalytics,
  analytics, loading,
}) {
  const [isSimModalOpen, showSimModal] = useState(false);
  const [searches, setSearches] = useState([]);
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedProperty, selectProperty] = useState({});
  const [selectedDay, selectDay] = useState(moment().weekday());
  const [averageBooked, setAverageBooked] = useState(true);
  const [selectedWeek, selectWeek] = useState(1);
  const [oldestDate, setOldestDate] = useState(moment());

  useEffect(() => {
    getProviders();
    getStudents();
    getOrgSummary();
    getAnalytics(['Algebra', 'Geometry']);
  }, [getProviders, getStudents, getOrgSummary, getAnalytics]);

  useEffect(() => {
    if (selectedProperty.value) {
      const { searches: newSearches, available } = analytics[selectedProperty.value]
        .trends[moment.weekdays()[selectedDay]];

      setSearches(newSearches);
      setAvailableHours(available);
    }
  }, [selectedProperty, analytics, selectedDay]);

  function createLegend({ names, colors }) {
    const legend = [];

    names.forEach((name, index) => {
      const type = 'fa fa-circle';
      legend.push(<i key={name} className={type} style={{ color: colors[index] }} />);
      legend.push(' ');
      legend.push(`${name} `);
    });

    return legend;
  }

  /**
   * Converts timestamp to Moment time object.
   *
   * Especially useful for Firestore timestamps which are stored in seconds, or Unix form.
   *
   * @since 2.1.0
   *
   * @param {number} seconds Unix timestamp.
   *
   * @returns {Moment} Moment time object.
   */
  const momTime = (seconds) => moment(seconds * 1000);

  useEffect(() => {
    if (Object.keys(analytics).length > 0) {
      // flattens Firestore data structure into [{ _seconds: 1234 }, { _seconds: 5678 }], then
      // sorts oldest to newest and grabs the first index (oldest) and converts to Moment object
      const oldestDataPoint = momTime(Object.values(analytics)
        .flatMap((property) => Object.values(property.trends))
        .flatMap((day) => Object.values(day).flat()).sort((a, b) => (
          // eslint-disable-next-line no-nested-ternary
          (a._seconds < b._seconds)
            ? -1
            : ((a._seconds === b._seconds)
              ? 0
              : 1
            )))[0]._seconds);

      oldestDataPoint
        .subtract(oldestDataPoint.weekday(), 'days') // go back to Sunday
        .add((selectedWeek - 1) * 7, 'days'); // go forward specified number of weeks

      setOldestDate(oldestDataPoint);
    }
  }, [analytics, selectedWeek]);

  /**
   * Filters array of timestamps by hour.
   *
   * Converts timestamps into Moment time objects and compares the hours to the specified filter
   * hour.
   *
   * @since 2.1.0
   *
   * @see momTime
   *
   * @param {array}  metric Array of Firestore timestamps.
   * @param {number} time   Hour to filter metric by.
   *
   * @returns {array} Filtered input array.
   */
  const getMetricAtTime = (metric, time) => metric
    .filter(({ _seconds }) => momTime(_seconds).hours() === time);

  /**
   * Filters array of timestamps by date.
   *
   * Converts timestamps into Moment time objects and compares the dates to the specified filter
   * date.
   *
   * @since 2.1.0
   *
   * @see momTime
   *
   * @param {array}  metric Array of Firestore timestamps.
   * @param {number} date   Date to filter metric by.
   *
   * @returns {number} Length of filtered input array.
   */
  const getMetricAtDate = (metric, date) => metric
    .filter(({ _seconds }) => momTime(_seconds).date() === date).length;

  /**
   * Averages values in provided array by single days.
   *
   * Finds unique dates in provided array of timestamps (assumed that all timestamps are on the
   * same weekday), then sorts through the unique dates and finds the length of datapoints on each
   * date. Averages these values and returns the output.
   *
   * @since 2.1.0
   *
   * @see momTime
   * @see getMetricAtDate
   *
   * @param {array} metric Array of Firestore timestamps.
   *
   * @returns {number} Average single day occurrences of provided timestamps.
   */
  const getWeekdayAverage = (metric) => {
    const uniqueDates = [...new Set(metric.map(({ _seconds }) => momTime(_seconds).date()))];

    if (uniqueDates.length === 0)
      return 0;

    return uniqueDates.map((date) => getMetricAtDate(metric, date)).reduce((a, b) => a + b, 0)
      / uniqueDates.length;
  };

  const databaseUpdateString = 'Just now';

  const statsRow = (
    <Row>
      <Col lg={3} sm={6}>
        <StatsCard
          bigIcon={<i className="pe-7s-server text-warning" />}
          statsText={`${alias.providers || alias.provider}`}
          statsValue={providers.length || '...'}
          statsIcon={<i className="fa fa-refresh" />}
          statsIconText={databaseUpdateString}
        />
      </Col>
      <Col lg={3} sm={6}>
        <StatsCard
          bigIcon={<i className="pe-7s-wallet text-success" />}
          statsText={`${alias.consumers || alias.consumer}`}
          statsValue={students.length || '...'}
          statsIcon={<i className="fa fa-calendar-o" />}
          statsIconText={databaseUpdateString}
        />
      </Col>
      <Col lg={3} sm={6}>
        <StatsCard
          bigIcon={<i className="pe-7s-graph1 text-danger" />}
          statsText="All Sessions Last Week"
          statsValue="223"
          statsIcon={<i className="fa fa-clock-o" />}
          statsIconText={databaseUpdateString}
        />
      </Col>
      <Col lg={3} sm={6}>
        <StatsCard
          bigIcon={<i className="fa fa-graduation-cap text-info" />}
          statsText={`${alias.provider} Sessions Last Week`}
          statsValue="+45"
          statsIcon={<i className="fa fa-refresh" />}
          statsIconText={databaseUpdateString}
        />
      </Col>
    </Row>
  );

  const sessionsPerDay = (
    <Row>
      <Col md={12}>
        <Card
          id="bookedSessionsChart"
          title="Booked Sessions"
          category="Weekly Average"
          statsIconText={databaseUpdateString}
          content={loading ? (
            <div style={{ height: 245 }}>
              <Loader />
            </div>
          ) : (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
              >
                <LargeFormControlLabel
                  control={(
                    <PrimarySwitch
                      checked={averageBooked}
                      onChange={({ target: { checked } }) => setAverageBooked(checked)}
                      name="toggleBookedAvg"
                    />
                  )}
                  label="All-Time Average"
                  style={{
                    textTransform: 'none',
                    fontSize: 14,
                    alignSelf: 'center',
                  }}
                />
                {!averageBooked && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p style={{ margin: 'auto', marginRight: 10 }}>
                      {/* {`${oldestDate.format('MMMM DD')}-${oldestDate.clone().add(7, 'days')
                        .format('MMMM DD')}`} */}
                      {`Week ${selectedWeek}`}
                    </p>
                    <IconButton
                      aria-label="left"
                      disabled={selectedWeek === 1}
                      size="small"
                      onClick={() => selectWeek(selectedWeek - 1)}
                    >
                      <ChevronLeft
                        fontSize="large"
                        style={{ color: selectedWeek === 1 ? 'lightgray' : 'gray' }}
                      />
                    </IconButton>
                    <IconButton
                      aria-label="right"
                      size="small"
                      onClick={() => selectWeek(selectedWeek + 1)}
                    >
                      <ChevronRight
                        fontSize="large"
                        style={{ color: 'gray' }}
                      />
                    </IconButton>
                  </div>
                )}
              </div>
              <div className="ct-chart">
                <ChartistGraph
                  data={{
                    labels: moment.weekdays(),
                    series: averageBooked
                      ? Object.values(analytics).map((property) => new Array(7).fill()
                        .map((_, index) => getWeekdayAverage(
                          property.trends[moment.weekdays()[index]]?.booked ?? [], index,
                        )))
                      : Object.values(analytics).map(({ trends }) => new Array(7).fill()
                        .map((_, index) => trends[moment.weekdays()[index]]?.booked
                          .filter(({ _seconds }) => momTime(_seconds).isAfter(oldestDate))
                          .length ?? 0)),
                  }}
                  type="Line"
                  options={{
                    showArea: false,
                    height: '245px',
                    axisX: {
                      showGrid: false,
                    },
                    axisY: {
                      labelInterpolationFnc: (value) => (Number.isInteger(value) ? value : null),
                    },
                    lineSmooth: true,
                    showLine: true,
                    showPoint: true,
                    fullWidth: true,
                    chartPadding: {
                      right: 80,
                    },
                  }}
                  responsiveOptions={responsiveSales}
                />
              </div>
            </div>
          )}
          legend={(
            <div className="legend">
              {createLegend({
                names: Object.keys(analytics),
                colors: ['#1DC7EA', '#FB404B', '#FFA534', '#9368E9', '#87CB16', '#1b8dff'],
              })}
            </div>
          )}
        />
      </Col>
    </Row>
  );

  const searchesVsAvailable = (
    <Row>
      <Col md={12}>
        <Card
          id="searchesAvailableChart"
          title="Searches vs. Available Hours"
          category="Hourly Average"
          statsIconText={databaseUpdateString}
          content={loading ? (
            <div style={{ height: 245 }}>
              <Loader />
            </div>
          ) : (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
              >
                <Select
                  isSearchable
                  className="basic-single"
                  classNamePrefix="select"
                  components={animatedComponents}
                  name="searchPropertySelect"
                  options={Object.keys(analytics)
                    .map((property) => ({ value: property, label: property }))}
                  onChange={(option) => {
                    selectProperty(option);
                  }}
                  styles={{
                    control: (styles) => ({
                      ...styles,
                      borderColor: 'hsl(0, 0%, 90%)',
                      width: 200,
                    }),
                    menu: (styles) => ({
                      ...styles,
                      width: 200,
                    }),
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p style={{ margin: 'auto', marginRight: 10 }}>
                    {moment.weekdays()[selectedDay]}
                  </p>
                  <IconButton
                    aria-label="left"
                    disabled={selectedDay === 0}
                    size="small"
                    onClick={() => selectDay(selectedDay - 1)}
                  >
                    <ChevronLeft
                      fontSize="large"
                      style={{ color: selectedDay === 0 ? 'lightgray' : 'gray' }}
                    />
                  </IconButton>
                  <IconButton
                    aria-label="right"
                    disabled={selectedDay === 6}
                    size="small"
                    onClick={() => selectDay(selectedDay + 1)}
                  >
                    <ChevronRight
                      fontSize="large"
                      style={{ color: selectedDay === 6 ? 'lightgray' : 'gray' }}
                    />
                  </IconButton>
                </div>
              </div>
              <div className="ct-chart">
                <ChartistGraph
                  data={{
                    labels: new Array(24).fill()
                      .map((_, index) => {
                        if (index % 2 === 0)
                          return moment().set('hours', index).format('ha');

                        return '';
                      }),
                    series: selectedProperty.value ? [
                      new Array(24).fill()
                        .map((_, index) => getWeekdayAverage(getMetricAtTime(searches, index))),
                      new Array(24).fill()
                        .map((_, index) => getWeekdayAverage(
                          getMetricAtTime(availableHours, index),
                        )),
                    ] : [],
                  }}
                  type="Line"
                  options={{
                    showArea: false,
                    height: '245px',
                    axisX: {
                      showGrid: false,
                    },
                    axisY: {
                      labelInterpolationFnc: (value) => (Number.isInteger(value) ? value : null),
                    },
                    lineSmooth: true,
                    showLine: true,
                    showPoint: true,
                    fullWidth: true,
                    chartPadding: {
                      right: 80,
                    },
                  }}
                  responsiveOptions={responsiveSales}
                />
              </div>
            </div>
          )}
          legend={(
            <div className="legend">
              {createLegend({
                names: ['Searches', 'Available Hours'],
                colors: ['#1DC7EA', '#FB404B'],
              })}
            </div>
          )}
        />
      </Col>
    </Row>
  );

  return (
    <div className="content">
      <Grid fluid>
        {orgState === 'watutor_default' && (
          <Row style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 15 }}>
            <Button
              bsSize="medium"
              bsStyle="info"
              onClick={() => showSimModal(true)}
              className="btn-fill"
              style={{
                fontWeight: 500,
                borderRadius: 10,
                alignSelf: 'flex-end',
              }}
            >
              + Create Simulation
            </Button>
          </Row>
        )}
        {statsRow}
        {sessionsPerDay}
        {searchesVsAvailable}
        <Row>
          {orgState !== 'watutor_default' && <OrgGroupLabels />}
        </Row>
      </Grid>
      <SimulationModal isOpen={isSimModalOpen} toggleOpen={showSimModal} />
    </div>
  );
}

Dashboard.propTypes = {
  alias: PropTypes.shape({
    property: PropTypes.string,
    properties: PropTypes.string,
    provider: PropTypes.string,
    providers: PropTypes.string,
    consumer: PropTypes.string,
    consumers: PropTypes.string,
  }),
  getProviders: PropTypes.func.isRequired,
  providers: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  getStudents: PropTypes.func.isRequired,
  students: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  orgState: PropTypes.string.isRequired,
  getOrgSummary: PropTypes.func.isRequired,
  getAnalytics: PropTypes.func.isRequired,
  analytics: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
};

Dashboard.defaultProps = {
  alias: {
    property: 'Category',
    properties: 'Categories',
    provider: 'Instructor',
    providers: 'Instructors',
    consumer: 'Student',
    consumers: 'Students',
  },
};

const mapStateToProps = ({
  userReducer, providersReducer, studentsReducer, analyticsReducer,
}) => ({
  alias: userReducer.alias,
  providers: providersReducer.list,
  students: studentsReducer.list,
  orgState: userReducer.org,
  analytics: analyticsReducer.analytics,
  loading: analyticsReducer.loading,
});

const mapDispatchToProps = (dispatch) => ({
  getProviders: () => dispatch(getProvidersThunk()),
  getStudents: () => dispatch(getStudentsThunk()),
  getOrgSummary: () => dispatch(getOrgSummaryThunk()),
  getAnalytics: (properties) => dispatch(getAnalyticsThunk(properties)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
