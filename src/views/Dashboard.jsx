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
import React, { useState } from 'react';
import ChartistGraph from 'react-chartist';
import { Grid, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Card } from 'components/Cards/Card';
import { StatsCard } from 'components/Cards/StatsCard';
import OrgProperties from 'components/Cards/Properties';
import OrgGroupLabels from 'components/Cards/GroupLabels';
import SearchForm from 'components/FormInputs/SearchForm';

import {
  dataPie,
  legendPie,
  dataSales,
  optionsSales,
  responsiveSales,
  legendSales,
  dataBar,
  optionsBar,
  responsiveBar,
  legendBar,
} from 'variables/Variables';

Dashboard.defaultProps = {
  alias: {
    property: 'Property',
    properties: 'Properties',
    provider: 'Tutor',
    providers: 'Tutors',
    consumer: 'Student',
    consumers: 'Students',
  },
};

function Dashboard({ alias, ...props }) {
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

  const databaseUpdateString = '6 Hours Ago';

  const statsRow = (
    <Row>
      <Col lg={3} sm={6}>
        <StatsCard
          bigIcon={<i className="pe-7s-server text-warning" />}
          statsText={`${alias.providers || alias.provider}`}
          statsValue="30"
          statsIcon={<i className="fa fa-refresh" />}
          statsIconText={databaseUpdateString}
        />
      </Col>
      <Col lg={3} sm={6}>
        <StatsCard
          bigIcon={<i className="pe-7s-wallet text-success" />}
          statsText={`${alias.consumers || alias.consumer}`}
          statsValue="27"
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

  const userBehaviorGraphRow = (
    <Row>
      <Col md={12}>
        <Card
          statsIcon="fa fa-history"
          id="chartHours"
          title="Activity"
          category="Last Week (Mockup)"
          statsIconText={databaseUpdateString}
          content={(
            <div className="ct-chart">
              <ChartistGraph
                data={dataSales}
                type="Line"
                options={optionsSales}
                responsiveOptions={responsiveSales}
              />
            </div>
                )}
          legend={
            <div className="legend">{createLegend(legendSales)}</div>
                }
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

  const searchRow = (
    <Row>
      <Col xs={12}>
        <p className="text-muted">Fill in one or more fields to search items</p>
      </Col>
      <Col md={6} sm={12}>
        <SearchForm
          searchType={`${alias.consumers || alias.consumer}`}
          onSearch={onSearchStudent}
          cols={['col-xs-6', 'col-xs-6']}
          searchProperties={[
            {
              label: 'Name',
              name: 'name',
              type: 'text',
              bsClass: 'form-control',
              placeholder: 'Dave Franco',
            }, {
              label: 'Contact (Phone or Email)',
              name: 'phone',
              type: 'text',
              bsClass: 'form-control',
              placeholder: '5033102400',
            },
          ]}
        />
      </Col>
      <Col md={6} sm={12}>
        <SearchForm
          searchType={`${alias.providers || alias.provider}`}
          cols={['col-xs-6', 'col-xs-6']}
          onSearch={onSearchProvider}
          searchProperties={[
            {
              label: 'Name',
              type: 'text',
              name: 'name',
              bsClass: 'form-control',
              placeholder: 'Username',
            },
            {
              label: 'Contact (Phone or Email)',
              type: 'phone',
              name: 'phone',
              bsClass: 'form-control',
              placeholder: '5033102400',
            },
          ]}
        />
      </Col>
      <Col md={6} sm={12}>
        <SearchForm
          searchType="Groups"
          cols={['col-xs-6', 'col-xs-6']}
          onSearch={onSearchGroup}
          searchProperties={[{
            label: 'Description',
            type: 'text',
            name: 'info',
            bsClass: 'form-control',
            placeholder: 'Username',
          }, {
            label: 'Member (name)',
            type: 'name',
            name: 'members',
            bsClass: 'form-control',
            placeholder: 'Email',
          }]}
        />
      </Col>
      <Col md={6} sm={12}>
        <SearchForm
          searchType="Sessions"
          cols={['col-sm-3', 'col-sm-3', 'col-sm-3', 'col-sm-3']}
          onSearch={onSearchSession}
          searchProperties={[{
            label: 'Name',
            type: 'name',
            name: 'name',
            bsClass: 'form-control',
            placeholder: 'Study Session',
          }, {
            label: 'About',
            type: 'text',
            name: 'about',
            bsClass: 'form-control',
            placeholder: 'Hotdogs',
          }, {
            label: 'Subject',
            type: 'text',
            name: 'subjects',
            bsClass: 'form-control',
            placeholder: 'Math 4',
          }, {
            label: 'Member (name)',
            type: 'name',
            name: 'members',
            bsClass: 'form-control',
            placeholder: 'Frank',
          }]}
        />
      </Col>
    </Row>
  );

  return (
    <div className="content">
      <Grid fluid>
        {statsRow}
        {userBehaviorGraphRow}
        <Row>
          {/* activityGraphCol */}
          <OrgGroupLabels />
          <OrgProperties />
        </Row>
        {searchRow}
      </Grid>
    </div>
  );
}

const mapStateToProps = ({ userReducer }) => ({
  alias: userReducer.alias,
});
const mapDispatchToProps = (dispatch, componentProps) => ({

});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Dashboard);
