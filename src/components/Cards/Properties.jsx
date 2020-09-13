import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';

import { setOrgSummaryPropertiesThunk } from 'redux/ducks/user.duck';
import { Card } from 'components/Cards/Card';
import AddModal from 'components/Modals/AddModal';
import Properties from 'components/Lists/Properties';

PropertiesCard.defaultProps = {
  alias: {
    property: 'Property',
    properties: 'Properties',
  },
  properties: [],
};

PropertiesCard.propTypes = {
  alias: PropTypes.objectOf(PropTypes.string),
  setProperties: PropTypes.func.isRequired,
  properties: PropTypes.arrayOf(PropTypes.string),
};

function PropertiesCard({ setProperties, properties, alias }) {
  const [isAddOpen, setAddOpen] = useState();
  const toggleAddOpen = () => setAddOpen(!isAddOpen);

  function handleAddSubjectProperty(data) {
    if (Array.isArray(data.property))
      return setProperties([...properties, ...data.property]);
    return setProperties([...properties, data.property]);
  }

  const addSubjectPropertyModal = (
    <AddModal
      onSubmit={handleAddSubjectProperty}
      isOpen={isAddOpen}
      toggleOpen={toggleAddOpen}
      processFile={(raw) => ({ property: raw.split(',') })}
      header={`Add ${alias.properties} to Organization`}
      infoText={`
      ${alias.properties} are central to providing context to the platform.
      Groups, sessions, and providers can be labeled with ${alias.properties.toLowerCase()}.
      For example a ${alias.property.toLowerCase()} of "Beginning Spanish" will be for early spanish learners.
      A session with "Spanish 1" will be between users learning beginning spanish.
      `}
      form={[
        {
          name: 'property',
          label: `New ${alias.property}`,
          type: 'text',
          bsClass: 'form-control',
          placeholder: 'Beginning Spanish',
        },
      ]}
    />
  );

  return (
    <Col md={6}>
      <Card
        title={`${alias.property}`}
        category={`Active ${alias.properties.toLowerCase()} in your organization for sessions and groups`}
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
              <Properties />
            </table>
          </div>
                )}
      />
      {addSubjectPropertyModal}
    </Col>
  );
}

const mapStateToProps = ({ userReducer }) => ({
  orgState: userReducer.org,
  loading: userReducer.loading,
  properties: userReducer.properties,
  alias: userReducer.alias,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  setProperties: (newProperties) => dispatch(setOrgSummaryPropertiesThunk(newProperties)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(PropertiesCard);
