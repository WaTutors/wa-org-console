import moment from 'moment';

import FirebaseAuthService from '../firebaseAuthService';

export const generateSessionMainAgGridColumns = (columnsToHide) => [{
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
}].filter((colObj) => {
  if (columnsToHide)
    return !columnsToHide.includes(colObj.field);
  return true;
});

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
  const provider = type === 'paid_available_timed'
    ? item.provider.name.slice(0, -2)
    : providerNameClassroom;
  const providerId = type === 'paid_available_timed' ? item.provider.pid : providerPidClassroom;

  return {
    name: provider,
    pid: providerId,
  };
}

// remove any prefix before last underscore
function stripUndPrefixArr(arr) {
  return arr.map((str) => {
    const undArr = str.split('_');
    return undArr[undArr.length - 1];
  });
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
export const mapSessionMainAgGridRows = (item) => {
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

  const { name: providerName, pid: providerId } = getProviderInfo(item, item.type);

  return {
    status,
    provider: providerName ? providerName.split('~')[0] : providerName,
    type,
    providerId,
    active: true,
    subjects: stripUndPrefixArr(type === 'Tutoring' ? [item.info.property] : item.info.properties),
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

/**
 * Retrieves download links for provider avatars.
 *
 * Intakes an array of profile IDs and returns and object of download URLs for each PID's avatar.
 *
 * @param {array}  pids  Array of PIDs.
 * @param {number} limit Optional limit of avatars to return.
 *
 * @returns {Object} Object of profile avatars with PIDs as keys and URLs as values.
 */
export const getProviderAvatars = async (pids, limit) => {
  const avatars = {};

  await Promise.all(pids.slice(0, limit).map(async (pid) => {
    if (!Object.keys(avatars).includes(pid)) {
      const ref = FirebaseAuthService.generateStorageRef(`profile/${pid}/avatar.png`);

      try {
        const avatar = await ref.getDownloadURL();
        avatars[pid] = avatar;
      } catch (e) {
        avatars[pid] = null;
      }
    }

    return null;
  }));

  return avatars;
};

/**
 * Parses session start and end time.
 *
 * Intakes a session start time in milliseconds and returns the parsed start and end time of the
 * session in the format h:mm [A]-h:mm A.
 *
 * @param {number} time Start time in milliseconds.
 *
 * @returns {string} Session start and end time in the format h:mm [A]-h:mm A.
 */
export const parseSessionTime = (time) => {
  const start = moment(time);

  // const end = moment(time).add(1, 'hour'); FIXME - testing 10 minute sessions.
  const end = moment(time).add(10, 'minutes');

  if (start.hours() === 11 && end.hours() === 12)
    return `${start.format('h:mm A')}-${end.format('h:mm A')}`;

  return `${start.format('h:mm')}-${end.format('h:mm A')}`;
};
