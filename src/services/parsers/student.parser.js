/* eslint-disable no-nested-ternary */
const generateStudentMainAgGridColumns = (columnsToHide, reservedProperties) => {
  let reserved = {};
  if (reservedProperties && Object.keys(reservedProperties).length > 0)
    reserved = Object.keys(reservedProperties).map((p) => ({
      headerName: p, field: p,
    }));

  return [{
    headerName: 'Invite', field: 'invite', flex: 0.5,
  }, {
    headerName: 'Name', field: 'name',
  },
  ...(reserved && reservedProperties ? reserved : []),
  {
    headerName: 'Phone Number', field: 'phone',
  }, {
    headerName: 'Labels', field: 'labels', flex: 1.25,
  }, {
    headerName: 'Remove', cellRenderer: 'deleteButton', width: 64, flex: 0.5,
  }].filter((colObj) => {
    if (columnsToHide)
      return !columnsToHide.includes(colObj.field);
    return true;
  });
};

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
function parseLabels(item, orgState, capsreduced) {
  return item.profile
    ? item.profile.org
      .filter((str) => str.includes(orgState) && str !== orgState && !Object.values(capsreduced).includes(str.replace(`${orgState}_`, ''))) // remove other org labels
      .map((str) => str.replace(`${orgState}_`, '')) // make human readable
    : item.labels
      ? item.labels.filter((str) => !Object.values(capsreduced).includes(str))
      : '';
}

const allCapsToText = (stringArr) => stringArr.map(
  (s) => s.charAt(0) + s.substring(1).toLowerCase(),
);

/**
 * parses database consumer object into something to be displayed
 *
 * database object structure can be seen in api db
 * @see generateStudentMainAgGridColumns associated columns
 *
 * @param {object} item consumer object
 * @param {string} orgState name of organization
 * @param {object} reservedProperties the reserved properties in the organization
 * @returns {object}
 */
const mapStudentMainAgGridRows = (item, orgState, reservedProperties) => {
  let reserved = [];
  let reduced = [];
  const capsreduced = [];
  if (reservedProperties && Object.keys(reservedProperties).length > 0) {
    reserved = Object.keys(reservedProperties).map((p) => ({
      [p]: item.profile
        ? allCapsToText(reservedProperties[p].filter((r) => item.profile.org.includes(`${orgState}_${r}`)) || '')
        : allCapsToText(reservedProperties[p].filter((r) => item.labels.includes(`${r}`)) || ''),
    }));
    reduced = reserved.reduce(((r, c) => Object.assign(r, c)), {});
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, val] of Object.entries(reduced))
      val.map((v) => capsreduced.push(v.toUpperCase()));
  }

  return ({
    invite: item.profile ? 'Accepted' : 'Sent',
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: item.profile && typeof item.phone === 'string' ? item.phone : item.to,
    labels: parseLabels(item, orgState, capsreduced),
    ...reduced,
    iid: item.iid,
    pid: item.pid,
    id: `u~${item.pid || item.iid}`,
    // groupNum: item.recentGroups ? Object.keys(item.recentGroups).length : 0,
    // groups: item.recentGroups ? Object.keys(item.recentGroups) : undefined,
  });
};

const generateStudentMembersAgGridColumns = () => [{
  headerName: 'Name', field: 'name',
}, {
  headerName: 'Phone Number', field: 'phone',
}, {
  headerName: 'Labels', field: 'labels', flex: 1.25,
}, {
  headerName: 'Enrolled', field: 'isIncluded', cellRenderer: 'checkbox', width: 100,
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
const mapStudentMembersAgGridRows = (item, itemData, orgState) => ({
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

export {
  generateStudentMainAgGridColumns,
  mapStudentMainAgGridRows,
  generateStudentMembersAgGridColumns,
  mapStudentMembersAgGridRows,
};
