// helpers used to format

// regex used to validate contact
// phone from https://www.w3resource.com/javascript/form/phone-no-validation.php
// email from https://stackoverflow.com/a/1373724

function isPhoneNumberUI(str) {
  if (!str)
    return false;
  const phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/; // 222-055-9034, 321.789.4512 or 123 256 4587 formats
  return !!str.match(phoneno);
}

function isPhoneNumberDb(str) {
  if (!str)
    return false;
  const phoneno = /^\+1[0-9]{10}$/; // 222-055-9034, 321.789.4512 or 123 256 4587 formats
  return !!str.match(phoneno);
}

function isEmail(str) {
  if (!str)
    return false;
  const emailadd = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  return !!str.match(emailadd);
}

/**
 * formats contact (field: phone) data for UI from Db data
 * @param {string} str
 * @returns {string} formatted
 */
function formatContactForUI(str) {
  if (isPhoneNumberDb(str))
    return `${str.slice(2, 5)} ${str.slice(5, 8)} ${str.slice(8)}`;
  if (isEmail(str))
    return str;
  // else, display with warning message
  return `${str || ''} --Invalid format--`;
}

/**
 * formats contact (field: phone) data for database from UI form
 * this is important because phone numbers require strict format
 *    eg +11234567890
 * @param {string} str contact field to format
 * @returns {string | false} formatted string or false if invalid
 */
function formatContactForDb(str) {
  if (isPhoneNumberUI(str)) {
    const strippedStr = str.replace(/[^0-9(). \s]/g, '').replace(' ', ''); // replace everything but digits
    const usPrefixStr = `+1${strippedStr}`;
    return usPrefixStr;
  }
  if (isEmail(str))
    return str;
  return false;
}

export {
  formatContactForUI,
  formatContactForDb,
};
