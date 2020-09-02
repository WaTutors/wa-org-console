import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';

import { setOrgSummaryPropertiesThunk } from 'redux/ducks/user.duck';
import { Card } from 'components/Cards/Card';
import AddModal from 'components/Modals/AddModal';
import Labels from 'components/Labels/Labels';

PropertiesCard.defaultProps = {
  alias: {
    property: "Property",
  },
};

function PropertiesCard({ setProperties, properties, alias }) {
  const [isAddOpen, setAddOpen] = useState();
  const toggleAddOpen = () => setAddOpen(!isAddOpen);

  function handleAddSubjectProperty(data) {
    if (Array.isArray(data.property))
      setProperties([...properties, ...data.property]);
    else
      setProperties([...properties, data.property]);
  }

  const addSubjectPropertyModal = (
    <AddModal
      onSubmit={handleAddSubjectProperty}
      isOpen={isAddOpen}
      toggleOpen={toggleAddOpen}
      processFile={(raw) => ({ property: raw.split(',') })}
      header={`Add ${alias.property} to Organization`}
      infoText={`
      ${alias.property} are central to providing context to the platform.
      Groups, sessions, and providers operate with ${alias.property.toLowerCase()}.
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
        category={`Active ${alias.property.toLowerCase()} for your organization for sessions and groups`}
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
      {addSubjectPropertyModal}
    </Col>
  );
}

const mapStateToProps = ({ userReducer }) => ({
  orgState: userReducer.org,
  loading: userReducer.loading,
  properties: userReducer.properties,
  alias: userReducer.alias
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  setProperties: (newProperties) => dispatch(setOrgSummaryPropertiesThunk(newProperties)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(PropertiesCard);
