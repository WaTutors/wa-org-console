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
import { Button, Row, Col } from 'react-bootstrap';

export class Card extends Component {
  render() {
    let icon; let buttonColor; let buttonSize; let buttonText; let onButtonClick;
    if (this.props.button)
      ({
        icon, buttonColor, buttonSize, buttonText, onButtonClick,
      } = this.props.button);

    return (
      <div className={`card${this.props.plain ? ' card-plain' : ''}`}>
        <Row style={{ padding: '10px' }}>
          <Col xs={8}>
            <h4 className="title">{this.props.title}</h4>
            <p className="category">{this.props.category}</p>
          </Col>
          { Boolean(this.props.button) && (
          <Col xs={4}>
            <Button
              block
              bsSize={buttonSize || 'med'}
              bsStyle={buttonColor}
              className="btn-fill"
              onClick={onButtonClick}
            >
              {icon && <i className={icon} />}
              {' '}
              {buttonText || 'default buttonText'}
            </Button>
          </Col>
          )}

        </Row>

        <div
          className={
            `content${
              this.props.ctAllIcons ? ' all-icons' : ''
            }${this.props.ctTableFullWidth ? ' table-full-width' : ''
            }${this.props.ctTableResponsive ? ' table-responsive' : ''
            }${this.props.ctTableUpgrade ? ' table-upgrade' : ''}`
          }
        >
          {this.props.content}

          <div className="footer">
            {this.props.legend}
            {this.props.stats != null ? <hr /> : ''}
            <div className="stats">
              <i className={this.props.statsIcon} />
              {' '}
              {this.props.stats}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Card;
