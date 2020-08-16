exports.generateSessionMainAgGridColumns = () => [{
  headerName: 'Name', field: 'name',
}, {
  headerName: 'About', field: 'about', minWidth: 150,
}, {
  headerName: 'Session Type', field: 'type', sortable: true,
}, {
  headerName: 'Subject', field: 'subjects', sortable: true, minWidth: 150,
}, {
  headerName: 'Tutor', field: 'provider', sortable: true,
}, {
  headerName: 'Start Time', field: 'startTime', sortable: true, filter: 'agDateColumnFilter',
}, {
  headerName: 'Created', field: 'created', sortable: true,
}, {
  headerName: '# Members', field: 'numMembers', filter: 'agNumberColumnFilter', sortable: true,
}, {
  headerName: 'Members', field: 'members', sortable: true, minWidth: 150,
}, {
  headerName: 'Status', field: 'status', sortable: true,
}, {
  headerName: 'Manage', cellRenderer: 'addUserButton', width: 75,
}, {
  headerName: 'Delete', cellRenderer: 'deleteItem', width: 75,
}];

/**
 * parses provider info from database object
 *
 * this is tricky because it could exist in two different locations
 * depending if it's a paid_available_timed type (tutor) or a
 * "free_private_timed" type (teacher)
 *
 * @param {object} item session object
 * @param {string} type the session type
 * @returns {object} name, and pid fields
 */
function getProviderInfo(item, type) {
  const providerNameClassroom = item.members && Object.keys(item.members)
    .filter((pid) => Boolean(item.members[pid].isLead) && item.activeMembers.includes(pid))[0]
    ? Object.values(item.members).filter((el) => Boolean(el.isLead))[0].name
    : null;
  const providerPidClassroom = item.members && Object.keys(item.members)
    .filter(
      (pid) => Boolean(item.members[pid].isLead) && item.activeMembers.includes(pid),
    )[0]
    ? Object.keys(item.members).filter(
      (pid) => Boolean(item.members[pid].isLead) && item.activeMembers.includes(pid),
    )[0]
    : null;
  const provider = type === 'paid_available_timed' ? item.provider.name : providerNameClassroom;
  const providerId = type === 'paid_available_timed' ? item.provider.pid : providerPidClassroom;

  return {
    name: provider,
    pid: providerId,
  };
}

/**
 * parses database session object into something to be displayed
 *
 * database object structure can be seen in api db
 * @see generateSessionMainAgGridColumns associated columns
 * @see getProviderInfo
 *
 * @param {object} item session object
 * @returns {object}
 */
exports.mapSessionMainAgGridRows = (item) => {
  const events = item.events || [];
  let status = 'No status';
  if (events.includes('ended'))
    status = 'Ended';
  else if (events.includes('ready'))
    status = 'Ready to start';

  let type = '';
  switch (item.type) {
    case 'paid_available_timed':
      type = 'Tutoring';
      break;
    case 'free_private_timed':
      type = 'Classroom';
      break;
    case 'free_private':
      type = 'Study Session';
      break;
    default:
      console.log('Session type not recognized', item);
  }

  const { name: providerName, pid: providerId } = getProviderInfo(item, type);

  return {
    status,
    provider: providerName,
    type,
    providerId,
    active: true,
    subjects: item.info.properties,
    name: item.info.name,
    about: item.info.about,
    startTime: new Date(item.info.start._seconds * 1000),
    providerEmail: item.provider ? item.provider.email : null,
    members: item.members ? Object.values(item.members).map((member) => member.name.split('~')[0]) : [],
    numMembers: item.activeMembers ? Object.values(item.activeMembers).length : 0,
    activeMembers: item.activeMembers,
    created: item.created ? new Date(item.created._seconds * 1000) : new Date(),
    sid: item.sid,
    id: `s~${item.sid}`,
  };
};
