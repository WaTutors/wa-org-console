import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { getOrgSummaryThunk, setOrgSummaryPropertiesThunk } from 'redux/ducks/user.duck';
import EditModal from 'components/Modals/EditModal';
import Button from '../Buttons/CustomButton';

Properties.propTypes = {
  getData: PropTypes.func.isRequired,
  setProperties: PropTypes.func.isRequired,
  properties: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  alias: PropTypes.object,
};
Properties.defaultProps = {
  alias: {
    property: 'Properties',
  },
};

function Properties({
  setProperties, getData, // redux thunks
  properties, loading, alias, // redux vars
}) {
  const [editProperty, setEditProperty] = useState();
  const [isEditOpen, setEditOpen] = useState();
  const toggleEditOpen = () => setEditOpen(!isEditOpen);

  useEffect(() => {
    if (!properties || properties.includes('Loading...'))
      getData();
  }, []);

  function handleRemove(toRemove) {
    setProperties(
      properties.filter((el) => el !== toRemove),
    );
  }

  function handleStartEdit(toEdit) {
    setEditOpen(true);
    setEditProperty(toEdit);
  }

  function handleSubmitEdit(form) {
    setProperties([
      ...properties.filter((el) => el !== editProperty),
      form.property,
    ]);
  }

  const edit = <Tooltip id="edit_tooltip">Edit</Tooltip>;
  const remove = <Tooltip id="remove_tooltip">Remove</Tooltip>;
  const property = properties || ['Loading...'];

  const tasks = [];
  let number;
  for (let i = 0; i < property.length; i++) {
    number = `checkbox${i}`;
    tasks.push(
      <tr key={i}>
        <td>{property[i]}</td>
        <td className="td-actions text-right">
          <OverlayTrigger placement="top" overlay={edit}>
            <Button
              bsStyle="info"
              simple
              type="button"
              bsSize="xs"
              onClick={() => handleStartEdit(property[i])}
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
              onClick={() => handleRemove(property[i])}
            >
              <i className="fa fa-times" />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>,
    );
  }
  return (
    <tbody>
      {tasks}
      <EditModal
        onSubmit={handleSubmitEdit}
        isOpen={isEditOpen}
        toggleOpen={toggleEditOpen}
        header={`Edit ${alias.property}`}
        infoText={`
      ${alias.property} are central to providing context to the platform.
      Groups, sessions, and providers operate with ${alias.property.toLowerCase()}.
      For example, ${alias.property.toLowerCase()} of "Beginning Spanish" will be for early spanish learners.
      A session with "Spanish 2" will be between users learning beginning spanish.
      `}
        form={[
          {
            name: 'property',
            label: `Edit ${alias.property}`,
            type: 'text',
            bsClass: 'form-control',
            placeholder: 'Beginning Spanish',
            defaultValue: editProperty,
          },
        ]}
      />
    </tbody>
  );
}

const mapStateToProps = ({ userReducer }) => ({
  orgState: userReducer.org,
  loading: userReducer.loading,
  properties: userReducer.properties,
  alias: userReducer.alias,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getOrgSummaryThunk()),
  setProperties: (newProperties) => dispatch(setOrgSummaryPropertiesThunk(newProperties)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(Properties);
