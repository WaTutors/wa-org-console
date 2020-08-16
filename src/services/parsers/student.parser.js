exports.generateStudentMainAgGridColumns = () => [{
  headerName: 'Invite', field: 'invite', flex: 0.5,
}, {
  headerName: 'Name', field: 'name',
}, {
  headerName: 'Phone Number', field: 'phone',
}, {
  headerName: 'Labels', field: 'labels', flex: 1.25,
}, {
  headerName: 'Remove', cellRenderer: 'deleteButton', width: 64, flex: 0.5,
}];

/**
 * parses organization labels into human readable format
 *
 * all labels for a user are stored as `${organization}_${label}`
 * within the same field
 *
 * @param {object} item session object
 * @param {string} orgState name of organization
 * @returns {array} list of human readable session labels
 */
function parseLabels(item, orgState) {
  return item.profile
    ? item.profile.org
      .filter((str) => str.includes(orgState) && str !== orgState) // remove other org labels
      .map((str) => str.replace(`${orgState}_`, '')) // make human readable
    : item.labels;
}

/**
 * parses database consumer object into something to be displayed
 *
 * database object structure can be seen in api db
 * @see generateStudentMainAgGridColumns associated columns
 *
 * @param {object} item consumer object
 * @param {string} orgState name of organization
 * @returns {object}
 */
exports.mapStudentMainAgGridRows = (item, orgState) => ({
  invite: item.profile ? 'Accepted' : 'Sent',
  name: item.profile ? item.profile.name.split('~')[0] : undefined,
  phone: item.profile && typeof item.phone === 'string' ? item.phone : item.to,
  labels: parseLabels(item, orgState),
  iid: item.iid,
  pid: item.pid,
  id: `u~${item.pid || item.iid}`,
  // groupNum: item.recentGroups ? Object.keys(item.recentGroups).length : 0,
  // groups: item.recentGroups ? Object.keys(item.recentGroups) : undefined,
});

exports.generateStudentMembersAgGridColumns = () => [{
  headerName: 'Invite', field: 'invite', flex: 0.5,
}, {
  headerName: 'Name', field: 'name',
}, {
  headerName: 'Phone Number', field: 'phone',
}, {
  headerName: 'Labels', field: 'labels', flex: 1.25,
}, {
  headerName: 'Remove', cellRenderer: 'deleteButton', width: 64, flex: 0.5,
}];

/**
 * parses database consumer object into something to be displayed for
 * the members list grid
 *
 * database object structure can be seen in api db
 * @see generateStudentMembersAgGridColumns associated columns
 * @see ManageMembersModal
 *
 * @param {object} item consumer object
 * @param {object} itemData related group or session object
 * @param {string} orgState name of organization
 * @returns {object}
 */
exports.mapStudentMembersAgGridRows = (item, itemData, orgState) => ({
  invite: item.profile ? 'Accepted' : 'Sent',
  name: item.profile ? item.profile.name.split('~')[0] : undefined,
  labels: item.profile
    ? item.profile.org
      .filter((str) => str.includes(orgState) && str !== orgState)
      .map((str) => str.replace(`${orgState}_`, ''))
    : item.labels,
  isIncluded: itemData.activeMembers && itemData.activeMembers.includes(item.pid),
  id: item.pid || item.iid,
});
