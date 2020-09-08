/* eslint-disable no-nested-ternary */
const generateProviderMainAgGridColumns = (columnsToHide, reservedProperties) => {
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
    headerName: 'Labels', field: 'labels', flex: 1.25,
  }, {
    headerName: 'Phone Number', field: 'phone',
  }, {
    headerName: 'Rating', field: 'rating', flex: 0.75, filter: 'agNumberColumnFilter',
  }, {
    headerName: '# Ratings', field: 'ratingCount', flex: 0.75, filter: 'agNumberColumnFilter',
  }, {
    headerName: 'Subjects', field: 'properties', sortable: true, flex: 1.25,
  }, {
    headerName: 'Remove', cellRenderer: 'deleteButton', width: 64,
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

const allCapsToText = (stringArr) => stringArr.map(
  (s) => s.charAt(0) + s.substring(1).toLowerCase(),
);

/**
 * parses database provider object into something to be displayed
 *
 * @see generateProviderMainAgGridColumns associated columns
 *
 * @param {object} item session object
 * @param {string} orgState name of organization
 * @param {object} reservedProperties the reserved properties in the organization
 * @returns {object}
 */
const mapProviderMainAgGridRows = (item, orgState, reservedProperties) => {
  let reserved = [];
  let reduced = [];
  const capsreduced = [];
  // make array of {Column : Value} for each reserved property
  if (reservedProperties && Object.keys(reservedProperties).length > 0) {
    reserved = Object.keys(reservedProperties).map((p) => ({
      [p]: item.profile
        ? allCapsToText(reservedProperties[p].filter((r) => item.profile.org.includes(`${orgState}_${r}`)) || '')
        : allCapsToText(reservedProperties[p].filter((r) => item.labels.includes(`${r}`)) || ''),
    }));
    // reduce it to one object for spread
    reduced = reserved.reduce(((r, c) => Object.assign(r, c)), {});
    // recreate caps list of reserved properties present in this item
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, val] of Object.entries(reduced))
      val.map((v) => capsreduced.push(v.toUpperCase()));
  }

  return ({
    invite: item.profile ? 'Accepted' : 'Sent',
    name: item.profile ? item.profile.name.split('~')[0] : undefined,
    phone: item.profile ? item.phone : item.to,
    rating: item.rating,
    ratingCount: item.numRating,
    properties: item.profile ? item.profile.properties : null,
    ...reduced,
    labels: item.profile
      ? item.profile.org
        .filter((str) => str.includes(orgState) && str !== orgState
          && !Object.values(capsreduced).includes(str.replace(`${orgState}_`, '')))
        .map((str) => str.replace(`${orgState}_`, ''))
      // if invitation
      : item.labels
        ? item.labels.filter((str) => !Object.values(capsreduced).includes(str))
        : '',
    iid: item.iid,
    pid: item.pid,
  });
};

const generateProviderMembersAgGridColumns = () => [{
  headerName: 'Name', field: 'name',
}, {
  headerName: 'Role', field: 'instructorType',
}, {
  headerName: 'Labels', field: 'labels', flex: 1.25,
}, {
  headerName: 'Rating', field: 'rating', flex: 0.75, filter: 'agNumberColumnFilter',
}, {
  headerName: 'Subjects', field: 'properties', sortable: true, flex: 1.25,
}, {
  headerName: 'Enrolled', field: 'isIncluded', cellRenderer: 'checkbox', width: 100,
}];

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
  properties: item.profile ? item.profile.properties : null,
  labels: item.profile
    ? item.profile.org
      .filter((str) => str.includes(orgState) && str !== orgState
    && !str.includes('TEACHER') && !str.includes('TUTOR'))
      .map((str) => str.replace(`${orgState}_`, ''))
  // if invitation
    : item.labels
      .filter((str) => str !== 'TEACHER' && str !== 'TUTOR'),
  isIncluded: itemData.providerId && itemData.providerId === item.pid,
  id: item.pid,
});

export {
  mapProviderMembersAgGridRows,
  generateProviderMembersAgGridColumns,
  mapProviderMainAgGridRows,
  generateProviderMainAgGridColumns,
};
