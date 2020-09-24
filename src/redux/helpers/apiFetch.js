import fetch from 'isomorphic-fetch';

import firebaseAuthService from 'services/firebaseAuthService';

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
      Authorization: `Bearer ${await firebaseAuthService.getToken()}`,
    },
  };

  if (method !== 'GET')
    config.body = JSON.stringify(body);

  const baseUrl = true // FIXME before deploying set to true
    ? 'https://v2-0-30-dot-watutors-1.uc.r.appspot.com'
    : 'http://localhost:3001';

  return fetch(`${baseUrl}/v2/${endpoint.replace('+', '%2B')}`, config)
    .then((response) => parseResponse(response))
    .catch((error) => {
      console.error(`API ${method} Error: ${error}`);
      throw new Error(error);
    });
}

async function parseResponse(response) {
  const { status } = response;

  console.log(`HTML response code: ${status}`);
  if (!successCodes.includes(status))
    throw new Error(`${status} - ${await response.text()}`);

  const content = response.headers.get('content-type');
  if (content.includes('json'))
    return response.json()
      .then((data) => {
        console.log('Response content', { JSON: JSON.stringify(data, null, 2) });
        return data;
      });

  return response.text()
    .then((data) => {
      console.log(`Response content not JSON, instead ${content}: ${data}`);
      return data;
    });
}
