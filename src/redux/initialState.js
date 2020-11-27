export default {
  properties: {
    list: [
      'Math 1',
      'Math 2',
      'Math 3',
      'Spanish 1',
      'Spanish 2',
      'ESL',
    ],
    loading: false,
    error: false,
  },
  user: {
    org: false, // testorg
    name: 'Loading...',
    properties: ['Loading...'],
  },
  students: {
    list: [],
    loading: false,
    error: false,
  },
  providers: {
    list: [],
    loading: false,
    error: false,
  },
  groups: {
    list: [],
    loading: false,
    error: false,
  },
  sessions: {
    list: [],
    availableSessions: [],
    loading: false,
    error: false,
  },
  analytics: {
    analytics: {},
    loading: false,
    error: null,
  },
};
