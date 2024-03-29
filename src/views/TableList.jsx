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
import {
  Grid, Row, Col, Table,
} from 'react-bootstrap';

import Card from 'components/Cards/Card';
import { thArray, tdArray } from 'variables/Variables';

class TableList extends Component {
  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Striped Table with Hover"
                category="Here is a subtitle for this table"
                ctTableFullWidth
                ctTableResponsive
                content={(
                  <Table striped hover>
                    <thead>
                      <tr>
                        {thArray.map((prop, key) => <th key={key}>{prop}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tdArray.map((prop, key) => (
                        <tr key={key}>
                          {prop.map((prop, key) => <td key={key}>{prop}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </Col>

            <Col md={12}>
              <Card
                plain
                title="Striped Table with Hover"
                category="Here is a subtitle for this table"
                ctTableFullWidth
                ctTableResponsive
                content={(
                  <Table hover>
                    <thead>
                      <tr>
                        {thArray.map((prop, key) => <th key={key}>{prop}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tdArray.map((prop, key) => (
                        <tr key={key}>
                          {prop.map((prop, key) => <td key={key}>{prop}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default TableList;
