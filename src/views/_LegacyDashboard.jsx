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
import React, { Component } from 'react';
import ChartistGraph from 'react-chartist';
import { Grid, Row, Col } from 'react-bootstrap';

import { Card } from 'components/Cards/Card';
import { StatsCard } from 'components/Cards/StatsCard';
import Labels from 'components/Labels/Labels';
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

class Dashboard extends Component {
  createLegend(json) {
    const legend = [];
    for (let i = 0; i < json.names.length; i++) {
      const type = `fa fa-circle text-${json.types[i]}`;
      legend.push(<i className={type} key={i} />);
      legend.push(' ');
      legend.push(json.names[i]);
    }
    return legend;
  }

  onSearchGroup(formData) {
    alert(`Search Group: ${JSON.stringify(formData)}`);
  }

  onSearchStudent(formData) {
    alert(`Search Student: ${JSON.stringify(formData)}`);
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col lg={6} sm={12}>
              <SearchForm
                searchType="Student"
                onSearch={this.onSearchStudent}
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
            <Col lg={6} sm={12}>
              <SearchForm
                searchType="Group"
                cols={['col-xs-6', 'col-xs-6']}
                onSearch={this.onSearchGroup}
                searchProperties={[
                  {
                    label: 'Label',
                    type: 'text',
                    name: 'label',
                    bsClass: 'form-control',
                    placeholder: 'Username',
                  },
                  {
                    label: 'Phone Number',
                    type: 'phone',
                    name: 'phone',
                    bsClass: 'form-control',
                    placeholder: 'Email',
                  },
                ]}
              />
            </Col>
          </Row>
          <Row>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-warning" />}
                statsText="Capacity"
                statsValue="105GB"
                statsIcon={<i className="fa fa-refresh" />}
                statsIconText="Updated now"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-wallet text-success" />}
                statsText="Revenue"
                statsValue="$1,345"
                statsIcon={<i className="fa fa-calendar-o" />}
                statsIconText="Last day"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-graph1 text-danger" />}
                statsText="Errors"
                statsValue="23"
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText="In the last hour"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-twitter text-info" />}
                statsText="Followers"
                statsValue="+45"
                statsIcon={<i className="fa fa-refresh" />}
                statsIconText="Updated now"
              />
            </Col>
          </Row>
          <Row>
            <Col md={8}>
              <Card
                statsIcon="fa fa-history"
                id="chartHours"
                title="Users Behavior"
                category="24 Hours performance"
                stats="Updated 6 hours ago"
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
                  <div className="legend">{this.createLegend(legendSales)}</div>
                }
              />
            </Col>
            <Col md={4}>
              <Card
                statsIcon="fa fa-clock-o"
                title="Email Statistics"
                category="Last Campaign Performance"
                stats="Campaign sent 2 days ago"
                content={(
                  <div
                    id="chartPreferences"
                    className="ct-chart ct-perfect-fourth"
                  >
                    <ChartistGraph data={dataPie} type="Pie" />
                  </div>
                )}
                legend={
                  <div className="legend">{this.createLegend(legendPie)}</div>
                }
              />
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Card
                id="chartActivity"
                title="2014 Sessions"
                category="All products including Taxes"
                stats="Data information certified"
                statsIcon="fa fa-check"
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
                  <div className="legend">{this.createLegend(legendBar)}</div>
                }
              />
            </Col>

            <Col md={6}>
              <Card
                title="Labels"
                category="Active labels for your organization"
                stats="Updated 3 minutes ago"
                statsIcon="fa fa-history"
                content={(
                  <div className="table-full-width">
                    <table className="table">
                      <Labels />
                    </table>
                  </div>
                )}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Dashboard;
