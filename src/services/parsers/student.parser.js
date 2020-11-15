/* eslint-disable no-nested-ternary */
import { formatContactForUI } from 'services/formatContactInfo';
import parsePhoneNumber from 'libphonenumber-js';

const generateStudentMainAgGridColumns = (columnsToHide, reservedLabels) => {
  let reserved = {};
  if (reservedLabels && Object.keys(reservedLabels).length > 0)
    reserved = Object.keys(reservedLabels).map((p) => ({
      headerName: p, field: p, reservedLabelData: reservedLabels[p],
    }));

  return [{
    headerName: 'Invite', field: 'invite', flex: 0.5,
  }, {
    headerName: 'Preferred Name', field: 'name',
  },
  ...(reserved && reservedLabels ? reserved : []),
  {
    headerName: 'Contact', field: 'phone',
  }, {
    headerName: 'Subjects', field: 'properties', flex: 1.25,
  }, {
    headerName: 'Edit',
    cellRenderer: 'editButton',
    sortable: false,
    suppressMenu: true,
    resizable: false,
    flex: 0.1,
  }, {
    headerName: 'Org', field: 'org', flex: 0.5,
  }, {
    headerName: 'Remove',
    cellRenderer: 'deleteButton',
    flex: 0.3,
    sortable: false,
    suppressMenu: true,
    resizable: false,
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
function parseLabels(item, orgState, capsreduced, fieldName = 'NAME') {
  if (item.profile) // if profile doc
    return item.profile.org
      .filter((str) => str.includes(orgState) && str !== orgState && !Object.values(capsreduced).includes(str.replace(`${orgState}_`, ''))) // remove other org labels
      .map((str) => str.replace(`${orgState}_`, ''))
      .filter((orgStr) => !orgStr.startsWith(`${orgState}_${fieldName}_`))
      .map((orgStr) => orgStr.replace(`${orgState}_${fieldName}_`, ''));
  if (item.labels) // if invite doc
    return item.labels.filter((str) => !Object.values(capsreduced).includes(str))
      .filter((orgStr) => !orgStr.startsWith(`${fieldName}_`))
      .map((orgStr) => orgStr.replace(`${fieldName}_`, ''));
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

/**
 * filter and format properties
 * @param {object} item consumer object
 * @param {object} itemData related group or session object
 * @param {string} orgState name of organization
 */
function parsePropertiesFromItem(item, orgState) {
  const orgPrefix = `${orgState}_`;
  if (item.profile && item.profile.properties)
    return item.profile.properties
      .filter((property) => (orgState === 'watutor_default' ? true : property.includes(orgPrefix)))
      .map((property) => property.replace(orgPrefix, ''));
  // else
  return null;
}

/**
 * parses organization labels into normal text, removes all caps and underscores
 *
 *
 * @param {array} stringArr array of label strings
 * @returns {array} each label string but first letter capitalized and underscores are spaces
 */
const allCapsToText = (stringArr) => stringArr.map(
  (fullstr) => {
    const unds = fullstr.split('_');
    const s = unds[unds.length - 1];
    return s.charAt(0) + s.substring(1).toLowerCase().replace(/_/g, ' ');
  },
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
  let reserved = []; // All of the reserved labels
  let reduced = []; // The reserved labels but only as a flat array
  const capsreduced = []; // the reduced array run through to be user readable

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
            : allCapsToText(reservedLabels[p].filter((r) => item.labels.includes(r))),
        };
      console.error(`In mapStudentMainAgGridRows, label type not recognized: ${reservedLabels[p]}`);
      return {}; // other
    });
    reduced = reserved.reduce(((r, c) => Object.assign(r, c)), {});
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, val] of Object.entries(reduced))
      val.map((v) => capsreduced.push(v.replace(/ /g, '_')));
  }

  const phone = parsePhoneNumber(String(item.phone || item.to));

  return ({
    invite: item.profile ? 'Accepted' : 'Sent',
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: phone ? phone.formatNational() : 'DELETED',
    labels: parseLabels(item, orgState, capsreduced),
    nickname: parseTextLabel(item, orgState),
    properties: parsePropertiesFromItem(item, orgState),
    ...reduced,
    iid: item.iid,
    pid: item.pid,
    id: `u~${item.pid || item.iid}`,
    org: orgState === 'watutor_default'
      ? item.profile.org.filter((org) => !org.includes('_'))
      : '',
    // groupNum: item.recentGroups ? Object.keys(item.recentGroups).length : 0,
    // groups: item.recentGroups ? Object.keys(item.recentGroups) : undefined,
  });
};

const generateStudentMembersAgGridColumns = (columnsToHide, reservedLabels) => {
  let reserved = {};
  if (reservedLabels && Object.keys(reservedLabels).length > 0)
    reserved = Object.keys(reservedLabels).map((p) => ({
      headerName: p, field: p,
    }));

  return [{
    headerName: 'Preferred Name', field: 'name',
  }, {
    headerName: 'Contact', field: 'phone',
  },
  ...(reserved && reservedLabels ? reserved : []),
  {
    headerName: 'Enrolled', field: 'isIncluded', cellRenderer: 'checkbox', width: 100,
  }];
};
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
const mapStudentMembersAgGridRows = (item, itemData, orgState) => {
  const phone = parsePhoneNumber(String(item.phone || item.to));

  return {
    invite: item.profile ? 'Accepted' : 'Sent',
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: phone ? phone.formatNational() : 'DELETED',
    labels: item.profile
      ? item.profile.org
        .filter((str) => str.includes(orgState) && str !== orgState)
        .map((str) => str.split('_')[-1])
      : item.labels,
    isIncluded: itemData.activeMembers && itemData.activeMembers.includes(item.pid),
    id: item.pid || item.iid,
  };
};

/**
 * parses a student document into a name field
 * uses "full name" label, if not found will use name
 * this is used to display a student where they need to be represented
 *
 * @param {object} studentDoc consumer object from the database document
 * @returns {string} parsed name
 */
function parseNameFromStudent(studentDoc) {
  if (!studentDoc.profile)
    return 'Invite';

  const fullNameLabel = studentDoc.profile.org.filter((str) => str.includes('Full Name'));
  if (fullNameLabel && Array.isArray(fullNameLabel) && fullNameLabel[0])
    return fullNameLabel[0].split('Full Name_')[1];
  return studentDoc.profile.name.split('~')[0];
}

/**
 * finds a users pid based on their name
 * this is a difficult task because names could be located in labels or in profile
 */
function findPidByName(nameString, studentList, org) {
  if (!nameString)
    return false;

  const activeStudents = studentList.filter((doc) => doc.profile);

  for (let i = 0; i < activeStudents.length; i++) {
    const doc = activeStudents[i];
    // activeStudents.forEach((doc) => {
    if (doc.profile) {
      // first check "Full Name" field
      const foundLabels = doc.profile.org.filter((label) => label === (`${org}_Full Name_${nameString}`));
      if (foundLabels.length > 0)
        return doc.pid;
      if (doc.profile.name === `${nameString}~c`)
        return doc.pid;
      // else loop on
    }
  }
  // if not found and returned above, generate failure
  return `-- Unrecognized name: ${nameString} --`;
}

export {
  generateStudentMainAgGridColumns,
  mapStudentMainAgGridRows,
  generateStudentMembersAgGridColumns,
  mapStudentMembersAgGridRows,
  allCapsToText,
  parseNameFromStudent,
  findPidByName,
};
