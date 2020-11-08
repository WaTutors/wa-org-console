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
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import {
  Row,
  Col,
} from 'react-bootstrap';

import logo from 'assets/img/watutor-logo.png';
import AdminNavbarLinks from '../Navbars/AdminNavbarLinks.jsx';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: window.innerWidth,
    };
  }

  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? 'active' : '';
  }

  updateDimensions() {
    this.setState({ width: window.innerWidth });
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  render() {
    return (
      <div
        id="sidebar"
        className="sidebar"
        data-color={this.props.color}
      >
        <div className="logo">
          <Row>
            <Col xs={12}>
              <a
                href="https://watutor.com"
                className="simple-text logo-mini"
              >
                <div className="logo-img">
                  <img src={logo} alt="WaTutor Logo" />
                </div>
              </a>
            </Col>
            <Col xs={12}>
              <a
                className="simple-text logo-normal"
                style={{
                  marginTop: 15,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {this.props.orgState}
              </a>
            </Col>
          </Row>
        </div>
        <div className="sidebar-wrapper">
          <ul className="nav">
            {this.state.width <= 991 && false ? <AdminNavbarLinks /> : null}
            {this.props.routes.map((prop, key) => {
              if (prop.external)
                return (
                  <li
                    className={prop.upgrade
                      ? 'active active-pro'
                      : this.activeRoute(prop.layout + prop.path)}
                    key={key}
                  >
                    <a
                      href={prop.link}
                      className="nav-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </a>
                  </li>
                );

              if (!prop.redirect && prop.live)
                return (
                  <li
                    className={prop.upgrade
                      ? 'active active-pro'
                      : this.activeRoute(prop.layout + prop.path)}
                    key={key}
                  >
                    <NavLink
                      to={prop.layout + prop.path}
                      className="nav-link"
                    >
                      <i className={prop.icon} />
                      <p>{prop.name}</p>
                    </NavLink>
                  </li>
                );
              return null;
            })}
          </ul>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ userReducer }) => ({
  orgState: userReducer.name,
});

export default connect(mapStateToProps, null)(Sidebar);
