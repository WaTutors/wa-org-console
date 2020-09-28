exports.generateGroupMainAgGridColumns = (columnsToHide) => [{
  headerName: 'Name', field: 'name', sortable: true,
}, {
  headerName: 'Manage', cellRenderer: 'addUserButton', flex: 0.5, width: 64,
}, {
  headerName: 'Delete', cellRenderer: 'deleteItem', flex: 0.5,
}, {
  headerName: 'Description', field: 'info', sortable: true, flex: 1.5,
}, {
  headerName: 'Subjects', field: 'subjects', sortable: true,
}, {
  headerName: 'Created', field: 'created', sortable: true, filter: 'agDateColumnFilter',
}, {
  headerName: '# Members', field: 'numMembers', flex: 0.5, sortable: true, filter: 'agNumberColumnFilter',
}, {
  headerName: 'Members', field: 'members', sortable: true,
}, {
  headerName: 'Visible', field: 'visible', sortable: true,
}].filter((colObj) => {
  if (columnsToHide)
    return !columnsToHide.includes(colObj.field);
  return true;
});

// remove any prefix before last underscore
function stripUndPrefixArr(arr) {
  if (arr)
    return arr.map((str) => {
      const undArr = str.split('_');
      return undArr[undArr.length - 1];
    });
  return '';
}

/**
 * parses database group object into something to be displayed
 *
 * @see generateGroupMainAgGridColumns associated columns
 *
 * @param {object} item session object
 * @returns {object}
 */
exports.mapGroupMainAgGridRows = (item) => {
  const createdDateTime = item.created ? new Date(item.created._seconds * 1000) : new Date();
  const TimeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };

  return {
    name: item.name || 'Not Found',
    subjects: stripUndPrefixArr(item.properties),
    info: item.info,
    members: item.activeMembers
      ? item.activeMembers.map((pid) => item.members[pid] && item.members[pid].name.split('~')[0])
      : [],
    activeMembers: item.activeMembers,
    numMembers: item.activeMembers ? item.activeMembers.length : 0,
    created: createdDateTime.toLocaleDateString('en-US', TimeOptions),
    gid: item.gid,
    visible: item.hidden ? 'No' : 'Yes',
    id: `g~${item.gid}`,
  };
};

exports.generateGroupMembersAgGridColumns = () => [{
  headerName: 'Name', field: 'name', sortable: true,
}, {
  headerName: 'Description', field: 'info', sortable: true, flex: 1.5,
}, {
  headerName: 'Subject', field: 'subjects', sortable: true,
}, {
  headerName: '# Members', field: 'numMembers', sortable: true, flex: 0.75, filter: 'agNumberColumnFilter',
}, {
  headerName: 'Members', field: 'members', sortable: true,
}, {
  headerName: 'Enrolled', field: 'isIncluded', cellRenderer: 'checkbox', width: 100,
}];

/**
 * parses database Group object into something to be displayed for
 * the members list grid
 *
 * database object structure can be seen in api db
 * @see generateGroupMembersAgGridColumns associated columns
 * @see ManageMembersModal
 *
 * @param {object} item consumer object
 * @param {object} itemData related group or session object
 * @param {string} orgState name of organization
 * @returns {object}
 */
exports.mapGroupMembersAgGridRows = (item, itemData, orgState) => ({
  subjects: item.labels,
  info: item.info,
  activeMembers: item.activeMembers,
  id: item.gid,
  name: item.name || 'Not Found',
  visible: item.hidden ? 'No' : 'Yes',
  numMembers: item.activeMembers ? item.activeMembers.length : 0,
  members: item.activeMembers
    ? item.activeMembers.map((pid) => item.members[pid] && item.members[pid].name.split('~')[0])
    : [],
  isIncluded: item.activeMembers
    && itemData.activeMembers
    && item.activeMembers.length > 0 // only show if group has members
    // && item.activeMembers.length === itemData.activeMembers.length // filter subsets
    && item.activeMembers
      .every((pid) => itemData.activeMembers.includes(pid)), // evey user is included
});

/**
 * finds a groups pid based on its name
 * this is a difficult task because names could be located in labels or in profile
 */
exports.findGroupByName = (nameString, groupList) => {
  if (!nameString)
    return false;

  for (let i = 0; i < groupList.length; i++) {
    const doc = groupList[i];
    if (doc.name === nameString)
      return doc;
  }
  return `-- Unrecognized group: ${nameString} --`;
};
