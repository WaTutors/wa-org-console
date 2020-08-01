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

import { Card } from 'components/Card/Card.jsx';
import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
import { Labels } from 'components/Labels/Labels.jsx';
import SearchForm from 'components/FormInputs/SearchForm.jsx';
import AddModal from 'components/Modals/AddModal';

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
} from 'variables/Variables.jsx';

function Dashboard(props) {
  const [isAddOpen, setAddOpen] = useState();
  const toggleAddOpen = () => setAddOpen(!isAddOpen);

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
    alert('Search Group coming soon!');
  }

  function onSearchStudent(formData) {
    console.log('onSearchStudent formData', formData);
    props.history.push('/admin/students', { filters: formData }); // pass to route
  }

  function onSearchProvider(formData) {
    console.log('onSearchProvider formData', formData);
    props.history.push('/admin/providers', { filters: formData }); // pass to route
  }

  function onSearchSession() {
    alert('Search Session coming soon!');
  }

  function handleAddSubjectProperty() {
    window.alert('Add not yet implemented');
  }

  const databaseUpdateString = '6 Hours Ago';

  const statsRow = (
    <Row>
      <Col lg={3} sm={6}>
        <StatsCard
          bigIcon={<i className="pe-7s-server text-warning" />}
          statsText="Tutors"
          statsValue="3"
          statsIcon={<i className="fa fa-refresh" />}
          statsIconText={databaseUpdateString}
        />
      </Col>
      <Col lg={3} sm={6}>
        <StatsCard
          bigIcon={<i className="pe-7s-wallet text-success" />}
          statsText="Students"
          statsValue="10"
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
          statsText="Tutor Sessions Last Week"
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
          title="Users Behavior (Mockup)"
          category="24 Hours performance"
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
        title="Last 6 Months of Sessions"
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

  const labelsCol = (
    <Col md={6}>
      <Card
        title="Subjects"
        category="Active subjects for your organization for sessions and groups"
        stats="Updated now"
        statsIcon="fa fa-history"
        button={{
          buttonColor: 'info',
          icon: 'pe-7s-plus',
          buttonText: 'Add',
          onButtonClick: () => setAddOpen(true),
        }}
        content={(
          <div className="table-full-width">
            <table className="table">
              <Labels />
            </table>
          </div>
                )}
      />
    </Col>
  );

  const searchRow = (
    <Row>
      <Col md={6} sm={12}>
        <SearchForm
          searchType="Students"
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
              label: 'Phone Number',
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
          searchType="Tutors"
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
              label: 'Phone Number',
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
          cols={['col-xs-4', 'col-xs-4', 'col-xs-4']}
          onSearch={onSearchGroup}
          searchProperties={[
            {
              label: 'Label',
              type: 'text',
              name: 'label',
              bsClass: 'form-control',
              placeholder: 'Username',
            },
            {
              label: 'User Phone',
              type: 'phone',
              name: 'phone',
              bsClass: 'form-control',
              placeholder: 'Email',
            },
            {
              label: 'Name Member',
              type: 'name',
              name: 'name',
              bsClass: 'form-control',
              placeholder: 'Email',
            },
          ]}
        />
      </Col>
      <Col md={6} sm={12}>
        <SearchForm
          searchType="Sessions"
          cols={['col-xs-6']}
          onSearch={onSearchSession}
          searchProperties={[
            {
              label: 'Coming Soon!',
              type: 'text',
              name: 'label',
              disabled: true,
              bsClass: 'form-control',
              placeholder: 'Not ready yet',
            },
          ]}
        />
      </Col>
    </Row>
  );

  const addSubjectPropertyModal = (
    <AddModal
      onSubmit={handleAddSubjectProperty}
      isOpen={isAddOpen}
      toggleOpen={toggleAddOpen}
      header="Add Subjects to Organization"
      infoText={`
      Subjects are central to providing context to the platform.
      Groups, sessions, and providers operate with subjects.
      For example a subject of "Beginning Spanish" will be for early spanish learners.
      A session with "Spanish 1" will be between users learning beginning spanish.
      `}
      form={[
        {
          name: 'property',
          label: 'New Subject Name',
          type: 'text',
          bsClass: 'form-control',
          placeholder: 'Beginning Spanish',
        },
      ]}
    />
  );

  return (
    <div className="content">
      <Grid fluid>
        {statsRow}
        {userBehaviorGraphRow}
        <Row>
          {activityGraphCol}
          {labelsCol}
        </Row>
        {searchRow}
      </Grid>
      {addSubjectPropertyModal}
    </div>
  );
}

export default Dashboard;
