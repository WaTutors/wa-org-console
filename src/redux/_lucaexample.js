import auth from '@react-native-firebase/auth';

import writeLog from './writeLog';

const successCodes = [200, 201, 202, 204, 303];

/**
 * Makes a fetch request to the Ingress-Egress API.
 *
 * Intakes a request endpoint, method, and optional body and parses into fetch config and makes
 * request. Returns either response from request or throws an error (to trigger failure Redux
 * handlers) along with displaying a generic error alert.
 *
 * @since 0.8.5
 *
 * @see writeLog
 * @see parseResponse
 *
 * @param {Object} param0             Object containing fetch data.
 * @param {string} param0.method      Type of fetch request to make.
 * @param {string} param0.endpoint    Endpoint to make request at.
 * @param {Object} [param0.body=null] Object containing optional body data for non-GET requests.
 *
 * @returns {string} Non-JSON response of fetch request.
 * @returns {Object} JSON response of fetch request.
 */
export default async function apiFetch({ method, endpoint, body = {} }) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await auth().currentUser.getIdToken()}`,
    },
  };

  if (method !== 'GET')
    config.body = JSON.stringify(body);

  writeLog(`API ${method} initiated: https://watutors-1.appspot.com/${endpoint}: ${JSON.stringify(config, null, 2)}`);
  // return fetch(`https://watutors-1.uc.r.appspot.com/${endpoint}`, config)
  return fetch(`https://20200729t210115-dot-watutors-1.uc.r.appspot.com/v2/${endpoint}`, config)
  // return fetch(`http://192.168.4.26:3001/v2/${endpoint}`, config)
  // return fetch(`http://192.168.254.147:3001/v2/${endpoint}`, config)
  // return fetch(`http://192.168.0.127:3001/v2/${endpoint}`, config)
    .then((response) => parseResponse(response))
    .catch((error) => {
      writeLog(`API ${method} Error: ${error}`);
      throw new Error(error);
    });
}

async function parseResponse(response) {
  const { status } = response;

  writeLog(`HTML response code: ${status}`);
  if (!successCodes.includes(status))
    throw new Error(`${status} - ${await response.text()}`);

  const content = response.headers.get('content-type');
  if (content.includes('json'))
    return response.json()
      .then((data) => {
        writeLog(`Response content JSON: ${JSON.stringify(data, null, 2)}`);
        return data;
      });

  return response.text()
    .then((data) => {
      writeLog(`Response content not JSON, instead ${content}: ${data}`);
      return data;
    });
}
