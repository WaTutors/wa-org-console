import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import {
  getOrgSummaryThunk, removeOrgGroupLabelsThunk,
} from 'redux/ducks/user.duck';
import EditModal from 'components/Modals/EditModal';
import ConfirmModal from 'components/Modals/ConfirmModal';
import Button from '../Buttons/CustomButton';

GroupLabels.propTypes = {
  getData: PropTypes.func.isRequired,
  removeAutoGroupLabels: PropTypes.func.isRequired,
  autoGroupLabels: PropTypes.arrayOf(PropTypes.string),
  loading: PropTypes.bool.isRequired,
  alias: PropTypes.object,
};
GroupLabels.defaultProps = {
  alias: {
    consumer: 'Consumer',
  },
  autoGroupLabels: [],
};

function GroupLabels({
  removeAutoGroupLabels, getData, // redux thunks
  autoGroupLabels, loading, alias, // redux vars
}) {
  const [editProperty, setEditProperty] = useState();
  const [isEditOpen, setEditOpen] = useState();
  const toggleEditOpen = () => setEditOpen(!isEditOpen);
  const [confirmText, setConfirmText] = useState('Delete');
  const [isConfirmOpen, setConfirmOpen] = useState();
  const toggleConfirmOpen = () => setConfirmOpen(!isConfirmOpen);
  const [storedToRemove, setToRemove] = useState();

  useEffect(() => {
    if (!autoGroupLabels || autoGroupLabels.includes('Loading...'))
      getData();
  }, []);

  function handleRemoveConfirm() {
    removeAutoGroupLabels(storedToRemove);
  }

  function handleRemove(toRemove) {
    setConfirmText('Are you sure you want to cancel this session?');
    setToRemove(toRemove);
    setConfirmOpen(true);
  }

  function handleStartEdit(toEdit) {
    setEditOpen(true);
    setEditProperty(toEdit);
  }

  function handleSubmitEdit(form) {
    window.alert('Editing not currently supported because Brett thinks it will be difficult');
  }

  const edit = <Tooltip id="edit_tooltip">Edit</Tooltip>;
  const remove = <Tooltip id="remove_tooltip">Remove</Tooltip>;
  const property = autoGroupLabels || ['Loading...'];

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
        header="Edit Auto-Group Label to Organization"
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
      <ConfirmModal
        onConfirm={handleRemoveConfirm}
        isOpen={isConfirmOpen}
        toggleOpen={toggleConfirmOpen}
        text={confirmText}
        confirmTextCheck={false}
      />
    </tbody>
  );
}

const mapStateToProps = ({ userReducer }) => ({
  orgState: userReducer.org,
  loading: userReducer.loading,
  autoGroupLabels: userReducer.groupLabels,
  alias: userReducer.alias,
});
const mapDispatchToProps = (dispatch, componentProps) => ({
  getData: () => dispatch(getOrgSummaryThunk()),
  removeAutoGroupLabels: (newGroupLabels) => dispatch(removeOrgGroupLabelsThunk(newGroupLabels)),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(GroupLabels);
