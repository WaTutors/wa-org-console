const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:3001';

const appConfig = {
  API_URL: baseURL,
};

const firebaseConfig = {
  app: {
    apiKey: 'AIzaSyCEcQQlgIHYKPHIp6pLsqNvf1ik-cyOnPg',
    authDomain: 'watutors-1.firebaseapp.com',
    databaseURL: 'https://watutors-1.firebaseio.com',
    projectId: 'watutors-1',
    storageBucket: 'watutors-1.appspot.com',
    messagingSenderId: '427074297383',
    appId: '1:427074297383:web:16965e63ca48616dd77802',
    measurementId: 'G-3M6MMLMBS6',
  },
};

export {
  appConfig,
  firebaseConfig,
};
