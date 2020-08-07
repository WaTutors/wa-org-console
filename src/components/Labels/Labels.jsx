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
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import Button from '../Buttons/CustomButton';
// TODO redux

class Labels extends Component {
  handleCheckbox(event) {
    const { target } = event;
    console.log(event.target);
    this.setState({
      [target.name]: target.checked,
    });
  }

  handleRemove(e) {
    console.log(e.target.value);
    alert('Live label curation coming soon!');
  }

  handleEdit(e) {
    console.log(e.target.value);
    alert('Live label curation coming soon!');
  }

  render() {
    const edit = <Tooltip id="edit_tooltip">Edit</Tooltip>;
    const remove = <Tooltip id="remove_tooltip">Remove</Tooltip>;
    const tasks_title = this.props.properties || ['Loading...'];
    console.log('Labels', this.props.loading);

    const tasks = [];
    let number;
    for (let i = 0; i < tasks_title.length; i++) {
      number = `checkbox${i}`;
      tasks.push(
        <tr key={i}>
          <td>{tasks_title[i]}</td>
          <td className="td-actions text-right">
            <OverlayTrigger placement="top" overlay={edit}>
              <Button
                bsStyle="info"
                simple
                type="button"
                bsSize="xs"
                onClick={this.handleEdit}
              >
                <i className="fa fa-edit" />
              </Button>
            </OverlayTrigger>

            <OverlayTrigger placement="top" overlay={remove}>
              <Button
                bsStyle="danger"
                simple
                type="button"
                bsSize="xs"
                onClick={this.handleRemove}
              >
                <i className="fa fa-times" />
              </Button>
            </OverlayTrigger>
          </td>
        </tr>,
      );
    }
    return <tbody>{tasks}</tbody>;
  }
}

const mapStateToProps = ({ propertiesReducer, groupsReducer }) => ({
  properties: propertiesReducer.list,
  loading: groupsReducer.loading,
});

export default connect(
  mapStateToProps, null,
)(Labels);
