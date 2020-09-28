/* eslint-disable no-nested-ternary */
import { formatContactForUI } from 'services/formatContactInfo';

const generateProviderMainAgGridColumns = (columnsToHide, reservedLabels) => {
  let reserved = {};
  if (reservedLabels && Object.keys(reservedLabels).length > 0)
    reserved = Object.keys(reservedLabels).map((p) => ({
      headerName: p, field: p,
    }));

  return [{
    headerName: 'Invite', field: 'invite', flex: 0.5,
  }, {
    headerName: 'Preferred Name', field: 'name',
  },
  ...(reserved && reservedLabels ? reserved : []),
  /* {
    headerName: 'Labels', field: 'labels', flex: 1.25,
  }, */ {
    headerName: 'Contact', field: 'phone',
  }, {
    headerName: 'Rating', field: 'rating', flex: 0.75, filter: 'agNumberColumnFilter',
  }, {
    headerName: '# Ratings', field: 'ratingCount', flex: 0.75, filter: 'agNumberColumnFilter',
  }, {
    headerName: 'Subjects', field: 'properties', flex: 1.25,
  }, {
    headerName: 'Edit', cellRenderer: 'editButton', width: 64, sortable: false,
  }, {
    headerName: 'Remove', cellRenderer: 'deleteButton', width: 64, sortable: false,
  },
    /* removed columns
    {headerName: 'Upcoming Sessions', field: 'upcomingSessions', sortable: true,
        flex: 0.75, filter: 'agNumberColumnFilter'},
    {headerName: 'Complete Sessions', field: 'completedSessions', sortable: true,
        flex: 0.75, filter: 'agNumberColumnFilter'},
    */
  ].filter((colObj) => {
    if (columnsToHide)
      return !columnsToHide.includes(colObj.field);
    return true;
  });
};

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
 * parses organization labels into normal text, removes all caps and underscores
 *
 *
 * @param {array} stringArr array of label strings
 * @returns {array} each label string but first letter capitalized and underscores are spaces
 */
const allCapsToText = (stringArr) => stringArr.map(
  (s) => s.charAt(0) + s.substring(1).toLowerCase().replace(/_/g, ' '),
);

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
  // if profile doc0.
  if (item.profile)
    return item.profile.org
      .filter((str) => str.includes(orgState) && str !== orgState && !Object.values(capsreduced).includes(str.replace(`${orgState}_`, ''))) // remove other org labels
      .map((str) => str.replace(`${orgState}_`, ''))
      .filter((orgStr) => !orgStr.startsWith(`${orgState}_${fieldName}_`))
      .map((orgStr) => orgStr.replace(`${orgState}_${fieldName}_`, ''));
  // if invite doc
  if (item.labels)
    return item.labels.filter((str) => !Object.values(capsreduced).includes(str))
      .filter((orgStr) => !orgStr.startsWith(`${fieldName}_`))
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
      .filter((property) => property.includes(orgPrefix))
      .map((property) => property.replace(orgPrefix, ''));
  // else
  return null;
}

/**
 * parses database provider object into something to be displayed
 *
 * @see generateProviderMainAgGridColumns associated columns
 *
 * @param {object} item session object
 * @param {string} orgState name of organization
 * @param {object} reservedLabels the reserved properties in the organization
 * @returns {object}
 */
const mapProviderMainAgGridRows = (item, orgState, reservedLabels) => {
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
            : allCapsToText(reservedLabels[p].filter((r) => item.labels.includes(`${r}`))),
        };
      console.error(`In mapProviderMainAgGridRows, label type not recognized: ${reservedLabels[p]}`);
      return {}; // other
    });
    reduced = reserved.reduce(((r, c) => Object.assign(r, c)), {});
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, val] of Object.entries(reduced))
      val.map((v) => capsreduced.push(v.toUpperCase().replace(/ /g, '_')));
  }
  return ({
    invite: item.profile ? 'Accepted' : 'Sent',
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: formatContactForUI(item.profile ? item.phone : item.to),
    rating: item.rating,
    ratingCount: item.numRating,
    properties: parsePropertiesFromItem(item, orgState),
    ...reduced,
    labels: parseLabels(item, orgState, capsreduced),
    nickname: parseTextLabel(item, orgState),
    iid: item.iid,
    pid: item.pid,
  });
};
const generateProviderMembersAgGridColumns = (columnsToHide, reservedLabels) => {
  let reserved = {};
  if (reservedLabels && Object.keys(reservedLabels).length > 0)
    reserved = Object.keys(reservedLabels).map((p) => ({
      headerName: p, field: p,
    }));

  return [{
    headerName: 'Preferred Name', field: 'name',
  }, {
    headerName: 'Full Name', field: 'nickname',
  },
  ...(reserved && reservedLabels ? reserved : []),
  {
    headerName: 'Rating', field: 'rating', flex: 0.75, filter: 'agNumberColumnFilter',
  }, {
    headerName: 'Subjects', field: 'properties', sortable: true, flex: 1.25,
  }, {
    headerName: 'Enrolled', field: 'isIncluded', cellRenderer: 'checkbox', width: 100,
  }];
};

function parseLabelsFromItem(item, itemData, orgState) {
  return item.profile
    ? item.profile.org
      .filter(
        (str) => str.includes(orgState) && str !== orgState
      && !str.includes('TEACHER') && !str.includes('TUTOR'),
      )
      .map((str) => str.replace(`${orgState}_`, ''))
    // if invitation
    : item.labels
      .filter((str) => str !== 'TEACHER' && str !== 'TUTOR');
}

/**
 * parses database Group object into something to be displayed for
 * the members list grid
 *
 * database object structure can be seen in api db
 * @see generateProviderMembersAgGridColumns associated columns
 * @see ManageMembersModal
 *
 * @param {object} item consumer object
 * @param {object} itemData related group or session object
 * @param {string} orgState name of organization
 * @returns {object}
 */
const mapProviderMembersAgGridRows = (item, itemData, orgState) => ({
  name: item.profile ? item.profile.name.split('~')[0] : undefined,
  rating: item.rating,
  properties: parsePropertiesFromItem(item, orgState),
  phone: formatContactForUI(item.profile ? item.phone : item.to),
  labels: parseLabelsFromItem(item, itemData, orgState),
  isIncluded: itemData.providerId && itemData.providerId === item.pid,
  id: item.pid,
});

/**
 * finds a users pid based on their name
 * this is a difficult task because names could be located in labels or in profile
 */
function findProviderPidByName(nameString, providerList, org) {
  if (!nameString)
    return false;

  const activeProviders = providerList.filter((doc) => doc.profile);
  console.log(activeProviders);

  for (let i = 0; i < activeProviders.length; i++) {
    const doc = activeProviders[i];
    // activeproviders.forEach((doc) => {
    if (doc.profile) {
      // first check "Full Name" field
      const foundLabels = doc.profile.org.filter((label) => label === (`${org}_Full Name_${nameString}`));
      if (foundLabels.length > 0)
        return doc.pid;
      if (doc.profile.name === `${nameString}~p`)
        return doc.pid;
      // else loop on
    }
  }
  // if not found and returned above, generate failure
  return `-- Unrecognized name: ${nameString} --`;
}

export {
  mapProviderMembersAgGridRows,
  generateProviderMembersAgGridColumns,
  mapProviderMainAgGridRows,
  generateProviderMainAgGridColumns,
  findProviderPidByName,
};
