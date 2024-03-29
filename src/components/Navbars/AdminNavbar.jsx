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
import { Navbar } from 'react-bootstrap';

import AdminNavbarLinks from './AdminNavbarLinks.jsx';

class Header extends Component {
  constructor(props) {
    super(props);
    this.mobileSidebarToggle = this.mobileSidebarToggle.bind(this);
    this.state = {
      sidebarExists: false,
    };
  }

  mobileSidebarToggle(e) {
    if (this.state.sidebarExists === false)
      this.setState({
        sidebarExists: true,
      });
    console.log('AdminNavbar mobileSidebarToggle triggered');

    e.preventDefault();
    document.documentElement.classList.toggle('nav-open');
    const node = document.createElement('div');
    node.id = 'bodyClick';
    node.onclick = function () {
      console.log('AdminNavbar node triggered', document.documentElement.className.indexOf('nav-open'));
      this.parentElement.removeChild(this);
      if (document.documentElement.className.indexOf('nav-open') === 0) // dont show sidebar if already open
        document.documentElement.classList.toggle('nav-open');
    };
    document.body.appendChild(node);
  }

  render() {
    return (
      <Navbar fluid>
        <Navbar.Header>
          <Navbar.Brand style={{ fontWeight: 700 }}>
            {this.props.brandText}
          </Navbar.Brand>
          <Navbar.Toggle onClick={this.mobileSidebarToggle} />
        </Navbar.Header>
        <Navbar.Collapse>
          <AdminNavbarLinks />
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;
