import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';

import { addOrgGroupLabelsThunk } from 'redux/ducks/user.duck';
import { Card } from 'components/Cards/Card';
import AddModal from 'components/Modals/AddModal';
import Labels from 'components/Lists/GroupLabels';

GroupLabelCard.propTypes = {
  alias: PropTypes.objectOf(PropTypes.string),
  addAutoGroupLabels: PropTypes.func.isRequired,
  mdCol: PropTypes.number,
};
GroupLabelCard.defaultProps = {
  alias: {
    consumer: 'Property',
  },
  mdCol: 6,
};

function GroupLabelCard({
  addAutoGroupLabels, alias, mdCol,
}) {
  const [isAddOpen, setAddOpen] = useState();
  const toggleAddOpen = () => setAddOpen(!isAddOpen);

  function handleAddGroupLabel(data) {
    return addAutoGroupLabels(data.label);
  }

  const addAutoGroupLabelModal = (
    <AddModal
      hideFile
      onSubmit={handleAddGroupLabel}
      isOpen={isAddOpen}
      toggleOpen={toggleAddOpen}
      header="Add Auto-Group Label to Organization"
      infoText={`
      Auto-Group Labels are a way to automatically generate groups from labels. 
      When a new ${alias.consumer} is added with any of these "Auto-Group Labels" then they will be added to a group. 
      These Groups can then be managed like any other.
      `}
      form={[
        {
          name: 'label',
          label: 'New Auto-Group Label',
          type: 'text',
          bsClass: 'form-control',
          placeholder: 'Grade 4',
        },
      ]}
    />
  );

  return (
    <Col md={mdCol}>
      <Card
        title={`${alias.property}`}
        category="Currently active Auto-Group Labels"
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
      {addAutoGroupLabelModal}
    </Col>
  );
}

const mapStateToProps = ({ userReducer }) => ({
  orgState: userReducer.org,
  loading: userReducer.loading,
  alias: userReducer.alias,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  addAutoGroupLabels: (newGroupLabels) => dispatch(addOrgGroupLabelsThunk(newGroupLabels)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(GroupLabelCard);
