exports.generateProviderMainAgGridColumns = (columnsToHide) => [{
  headerName: 'Invite', field: 'invite', flex: 0.5,
}, {
  headerName: 'Name', field: 'name',
}, {
  headerName: 'Role', field: 'instructorType',
}, {
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

const allCapsToText = (string) => string.map((s) => s.charAt(0) + s.substring(1).toLowerCase());

/**
 * parses database provider object into something to be displayed
 *
 * @see generateProviderMainAgGridColumns associated columns
 *
 * @param {object} item session object
 * @param {string} orgState name of organization
 * @returns {object}
 */
exports.mapProviderMainAgGridRows = (item, orgState, roles) => ({
  invite: item.profile ? 'Accepted' : 'Sent',
  name: item.profile ? item.profile.name.split('~')[0] : undefined,
  phone: item.profile ? item.phone : item.to,
  rating: item.rating,
  ratingCount: item.numRating,
  properties: item.profile ? item.profile.properties : null,
  instructorType: item.profile
    ? allCapsToText(roles.filter((r) => item.profile.org.includes(`${orgState}_${r}`)) || '')
    // if invitation
    : allCapsToText(roles.filter((r) => item.labels.includes(`${r}`)) || ''),
  labels: item.profile
    ? item.profile.org
      .filter((str) => str.includes(orgState) && str !== orgState
          && !roles.includes(str.replace(`${orgState}_`, '')))
      .map((str) => str.replace(`${orgState}_`, ''))
      // if invitation
    : item.labels
      .filter((str) => !roles.includes(str)),
  iid: item.iid,
  pid: item.pid,
});

exports.generateProviderMembersAgGridColumns = () => [{
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
exports.mapProviderMembersAgGridRows = (item, itemData, orgState) => ({
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
