// eslint-disable-next-line import/prefer-default-export
export function generateThunkActions(actionConstPrefix) {
  return {
    begin: (payload) => ({
      type: `${actionConstPrefix}_BEGIN`,
      payload,
    }),
    success: (payload) => ({
      type: `${actionConstPrefix}_SUCCESS`,
      payload,
    }),
    failure: (payload) => ({
      type: `${actionConstPrefix}_FAILURE`,
      payload,
    }),
  };
}
