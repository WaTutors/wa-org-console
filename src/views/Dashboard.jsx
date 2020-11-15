/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useEffect } from 'react';
import ChartistGraph from 'react-chartist';
import { Grid, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';

import moment from 'moment';

import { Card } from 'components/Cards/Card';
import { StatsCard } from 'components/Cards/StatsCard';
import OrgGroupLabels from 'components/Cards/GroupLabels';

import {
  optionsSales,
  responsiveSales,
  legendSales,
  dataBar,
  optionsBar,
  responsiveBar,
  legendBar,
} from 'variables/Variables';
import { getProvidersThunk } from 'redux/ducks/provider.duck';
import { getStudentsThunk } from 'redux/ducks/student.duck';
import { getOrgSummaryThunk } from 'redux/ducks/user.duck';

function Dashboard({
  alias, getProviders, providers, getStudents, students, orgState, getOrgSummary, ...props
}) {
  useEffect(() => {
    getProviders();
    getStudents();
    getOrgSummary();
  }, []);

  function createLegend(json) {
    const legend = [];
    for (let i = 0; i < json.names.length; i++) {
      const type = `fa fa-circle text-${json.types[i]}`;
      legend.push(<i className={type} key={i} />);
      legend.push(' ');
      legend.push(json.names[i]);
    }
    return legend;
  }

  function onSearchGroup(formData) {
    console.log('onSearchGroup formData', formData);
    props.history.push('/admin/groups', { filters: formData }); // pass to route
  }

  function onSearchStudent(formData) {
    console.log('onSearchStudent formData', formData);
    props.history.push('/admin/students', { filters: formData }); // pass to route
  }

  function onSearchProvider(formData) {
    console.log('onSearchProvider formData', formData);
    props.history.push('/admin/providers', { filters: formData }); // pass to route
  }

  function onSearchSession(formData) {
    console.log('onSearchSession formData', formData);
    props.history.push('/admin/sessions', { filters: formData }); // pass to route
  }

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

  const today = moment();

  const userBehaviorGraphRow = (
    <Row>
      <Col md={12}>
        <Card
          statsIcon="fa fa-history"
          id="chartHours"
          title="Activity"
          category="Last Week"
          statsIconText={databaseUpdateString}
          content={(
            <div className="ct-chart">
              <ChartistGraph
                data={{
                  labels: [
                    today.clone().subtract(6, 'days').format('dddd'),
                    today.clone().subtract(5, 'days').format('dddd'),
                    today.clone().subtract(4, 'days').format('dddd'),
                    today.clone().subtract(3, 'days').format('dddd'),
                    today.clone().subtract(2, 'days').format('dddd'),
                    today.clone().subtract(1, 'day').format('dddd'),
                    today.format('dddd'),
                  ],
                  series: [
                    [157, 142, 250, 325, 340, 105, 97],
                    [98, 127, 133, 140, 140, 75, 35],
                    [23, 63, 107, 140, 190, 239, 207],
                  ],
                }}
                type="Line"
                options={optionsSales}
                responsiveOptions={responsiveSales}
              />
            </div>
          )}
          legend={<div className="legend">{createLegend(legendSales)}</div>}
        />
      </Col>
    </Row>
  );

  const activityGraphCol = (
    <Col md={6}>
      <Card
        id="chartActivity"
        title="Last 6 Months of Sessions (Mockup)"
        category="All products including Taxes"
        stats={databaseUpdateString}
        statsIcon="fa fa-clock-o"
        content={(
          <div className="ct-chart">
            <ChartistGraph
              data={dataBar}
              type="Bar"
              options={optionsBar}
              responsiveOptions={responsiveBar}
            />
          </div>
        )}
        legend={
          <div className="legend">{createLegend(legendBar)}</div>
        }
      />
    </Col>
  );

  return (
    <div className="content">
      <Grid fluid>
        {statsRow}
        {userBehaviorGraphRow}
        <Row>
          {/* activityGraphCol */}
          {orgState !== 'watutor_default' && <OrgGroupLabels />}
        </Row>
      </Grid>
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

const mapStateToProps = ({ userReducer, providersReducer, studentsReducer }) => ({
  alias: userReducer.alias,
  providers: providersReducer.list,
  students: studentsReducer.list,
  orgState: userReducer.org,
});

const mapDispatchToProps = (dispatch) => ({
  getProviders: () => dispatch(getProvidersThunk()),
  getStudents: () => dispatch(getStudentsThunk()),
  getOrgSummary: () => dispatch(getOrgSummaryThunk()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
