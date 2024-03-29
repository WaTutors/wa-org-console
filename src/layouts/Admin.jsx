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

Edited Brett Stoddard 7/29 WaTutor

*/
import React, { Component } from "react";
import { connect } from 'react-redux';
import { Route, Switch } from "react-router-dom";
import NotificationSystem from "react-notification-system";
import { PropTypes } from 'prop-types';


import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";
// import FixedPlugin from "components/FixedPlugin/FixedPlugin.jsx";
import PrivateRoute from 'components/Security/PrivateRoute'

import { style } from "variables/Variables.jsx";

import routes from "routes.js";

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _notificationSystem: null,
      color: 'blue',
      fixedClasses: "dropdown show-dropdown open"
    };
  }
  handleNotificationClick = position => {
    var color = Math.floor(Math.random() * 4 + 1);
    var level;
    switch (color) {
      case 1:
        level = "success";
        break;
      case 2:
        level = "warning";
        break;
      case 3:
        level = "error";
        break;
      case 4:
        level = "info";
        break;
      default:
        break;
    }
    /*
    this.state._notificationSystem.addNotification({
      title: <span data-notify="icon" className="pe-7s-gift" />,
      message: (
        <div>
          Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for
          every web developer.
        </div>
      ),
      level: level,
      position: position,
      autoDismiss: 15
    });
    */
  };
  getRoutes = routes => {
    const { alias } = this.props;

    return routes.map((prop, key) => {
      if (prop.layout === "/admin") { // FIXME && prop.live
        return (
          <PrivateRoute
            key={key}
            path={prop.layout + prop.path}
            name={prop.name}
            // isOnDemandAvailable={isOnDemandAvailable} FIXME - enable when on-demand fully supported
            component={prop.component}
            customProps={ prop || {}}
            handleClick={this.handleNotificationClick}
          />
        );
      } else {
        return null;
      }
    });
  };
  getBrandText = path => {
    const { alias } = this.props;

    for (let i = 0; i < routes.length; i++) {
      if (
        this.props.location.pathname.indexOf(
          routes[i].layout + routes[i].path
        ) !== -1
      ) {
        return routes[i].name === 'Properties' ? alias.properties : routes[i].name;
      }
    }
    return "Brand";
  };
  handleImageClick = image => {
    this.setState({ image: image });
  };
  handleColorClick = color => {
    this.setState({ color: color });
  };
  handleHasImage = hasImage => {
    this.setState({ hasImage: hasImage });
  };
  handleFixedClick = () => {
    if (this.state.fixedClasses === "dropdown") {
      this.setState({ fixedClasses: "dropdown show-dropdown open" });
    } else {
      this.setState({ fixedClasses: "dropdown" });
    }
  };
  componentDidMount() {
    this.setState({ _notificationSystem: this.refs.notificationSystem });
    var _notificationSystem = this.refs.notificationSystem;
    var color = Math.floor(Math.random() * 4 + 1);
    var level;
    switch (color) {
      case 1:
        level = "success";
        break;
      case 2:
        level = "warning";
        break;
      case 3:
        level = "error";
        break;
      case 4:
        level = "info";
        break;
      default:
        break;
    }
    /* hide annoying notification
    _notificationSystem.addNotification({
      title: <span data-notify="icon" className="pe-7s-gift" />,
      message: (
        <div>
          Welcome to <b>Light Bootstrap Dashboard</b> - a beautiful freebie for
          every web developer.
        </div>
      ),
      level: level,
      position: "tr",
      autoDismiss: 15
    });
    */
  }
  componentDidUpdate(e) {
    if (
      window.innerWidth < 993 &&
      e.history.location.pathname !== e.location.pathname &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      console.log('Admin componentDidUpdate triggered')
      document.documentElement.classList.toggle("nav-open");
    }
    if (e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainPanel.scrollTop = 0;
    }
  }
  render() {
    const {
      orgState, history, location, alias,
    } = this.props;
    const { image, color, hasImage } = this.state;

    if (!orgState) history.push('/')

    return (
      <div className="wrapper">
        <NotificationSystem ref="notificationSystem" style={style} />
        <Sidebar
          {...this.props}
          routes={(orgState === 'watutor_default'
            ? routes
              .filter(({ name }) => name !== 'Group List')
            : routes)
            .map((route) => {
              if (route.name === 'Properties')
                return {
                  ...route,
                  name: `${alias.properties}`,
                };

              return route;
            })
          }
          color={color}
        />
        <div id="main-panel" className="main-panel" ref="mainPanel">
          <AdminNavbar
            {...this.props}
            brandText={this.getBrandText(location.pathname)}
          />
          <Switch>{this.getRoutes(routes)}</Switch>
          <Footer />
          {/*<FixedPlugin
            handleImageClick={this.handleImageClick}
            handleColorClick={this.handleColorClick}
            handleHasImage={this.handleHasImage}
            bgColor={this.state["color"]}
            bgImage={this.state["image"]}
            mini={this.state["mini"]}
            handleFixedClick={this.handleFixedClick}
            fixedClasses={this.state.fixedClasses}
          />*/}
        </div>
      </div>
    );
  }
}

Admin.propTypes = {
  alias: PropTypes.shape({
    properties: PropTypes.string,
  }),
};

Admin.defaultProps = {
  alias: {
    properties: 'Categories',
  },
};

const mapStateToProps = ({ userReducer }) => ({
  orgState: userReducer.org,
  alias: userReducer.alias,
});

export default connect(
  mapStateToProps, null,
)(Admin);
