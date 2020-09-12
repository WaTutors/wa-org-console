/* eslint-disable no-nested-ternary */
const generateStudentMainAgGridColumns = (columnsToHide, reservedLabels) => {
  let reserved = {};
  if (reservedLabels && Object.keys(reservedLabels).length > 0)
    reserved = Object.keys(reservedLabels).map((p) => ({
      headerName: p, field: p,
    }));

  return [{
    headerName: 'Invite', field: 'invite', flex: 0.5,
  }, {
    headerName: 'Preferred Name', field: 'name',
  }, {
    headerName: 'Full Name', field: 'nickname',
  },
  ...(reserved && reservedLabels ? reserved : []),
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
  // if profile doc0.
  if (item.profile)
    item.profile.org
      .filter((str) => str.includes(orgState) && str !== orgState && !Object.values(capsreduced).includes(str.replace(`${orgState}_`, ''))) // remove other org labels
      .map((str) => str.replace(`${orgState}_`, ''));
  // if invite doc
  if (item.labels)
    item.labels.filter((str) => !Object.values(capsreduced).includes(str));
  // else
  return '';
}

/**
 * parse name label
 *
 * name labels for a user are stored as `${organization}_NAME_${text}`
 * where text is freeform text given by the user
 *
 * @param {object} item session object
 * @param {string} orgState name of organization
 * @returns {array} list of human readable session labels
 */
function parseTextLabel(item, orgState, fieldName = 'NAME') {
  // if profile doc
  if (item.profile)
    return item.profile.org
      .filter((orgStr) => orgStr.startsWith(`${orgState}_${fieldName}_`))
      .map((orgStr) => orgStr.replace(`${orgState}_${fieldName}_`, ''));
  // else if invite doc
  if (item.labels)
    return item.labels.filter((orgStr) => orgStr.startsWith(`${fieldName}_`))
      .map((orgStr) => orgStr.replace(`${fieldName}_`, ''));
    // else
  return '';
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
 * @param {object} reservedLabels the reserved properties in the organization
 * @returns {object}
 */
const mapStudentMainAgGridRows = (item, orgState, reservedLabels) => {
  let reserved = [];
  let reduced = [];
  const capsreduced = []; // LD-- maybe add some comments to make this explainable

  if (reservedLabels && Object.keys(reservedLabels).length > 0) {
    reserved = Object.keys(reservedLabels).map((p) => {
      if (reservedLabels[p] === 'TEXT') // freeform label with keyword (field text)
        return {
          [p]: parseTextLabel(item, orgState, p),
        };
      if (Array.isArray(reservedLabels[p])) // array of possible labels (field options)
        return {
          [p]: item.profile // if profile or invite filter for relevant labels differently
            ? allCapsToText(reservedLabels[p].filter((r) => item.profile.org.includes(`${orgState}_${r}`)) || '')
            : allCapsToText(reservedLabels[p].filter((r) => item.labels.includes(`${r}`)) || ''),
        };
      console.error(`In mapStudentMainAgGridRows, label type not recognized: ${reservedLabels[p]}`);
      return {}; // other
    });
    console.log({ reserved });
    reduced = reserved.reduce(((r, c) => Object.assign(r, c)), {});
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, val] of Object.entries(reduced))
      val.map((v) => capsreduced.push(v.toUpperCase()));
  }
  console.log('student caps', { capsreduced });

  return ({
    invite: item.profile ? 'Accepted' : 'Sent',
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: item.profile && typeof item.phone === 'string' ? item.phone : item.to,
    labels: parseLabels(item, orgState, capsreduced),
    nickname: parseTextLabel(item, orgState),
    ...reduced,
    iid: item.iid,
    pid: item.pid,
    id: `u~${item.pid || item.iid}`,
    // groupNum: item.recentGroups ? Object.keys(item.recentGroups).length : 0,
    // groups: item.recentGroups ? Object.keys(item.recentGroups) : undefined,
  });
};

const generateStudentMembersAgGridColumns = () => [{
  headerName: 'Preferred Name', field: 'name',
}, {
  headerName: 'Full Name', field: 'nickname',
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
