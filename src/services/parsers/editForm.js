const getVertical = (property, allProperties) => {
  const fullProperty = allProperties
    .find((availableProperty) => availableProperty.includes(property));

  if (fullProperty)
    return fullProperty.split('_')[0];

  return '';
};

/**
 * formats the field data based on the form type to avoid missmatches
 * @param {object} field
 * @param {object} rowData
 */
function formatField(field, data) {
  console.log('formatField', { data, field });
  if (field.name && data)
    if (field.type === 'select' && Array.isArray(data))
      return data.map((el) => ({ value: el, label: el }));

  return undefined;
}

/**
 * combines data from rows with edit form to populate initial values
 *
 * @param {array} form array of form config objects
 * @param {object} rowData data from a row, eg a provider or group
 * @returns {array} form array with values set
 */
function populateFormInitialValues(form, rowData, org, properties) {
  console.log('populateFormInitialValues', {
    form, rowData, org, properties,
  });
  if (!form)
    return [];

  const populatedForm = form.map((field) => {
    const matchingVal = rowData[field.name];
    const formattedVal = formatField(field, matchingVal);
    console.log('populateFormInitialValues', field.name, { matchingVal, formattedVal });

    if (field.name === 'properties' && org === 'watutor_default' && rowData.properties) {
      const vertical = getVertical(rowData.properties[0], properties);
      return {
        ...field,
        options: field.options
          .filter((property) => property && property.value.split('_')[0] === vertical)
          .map((property) => ({
            value: property.value.split('_')[1],
            label: property.value.split('_')[1],
          })),
        defaultValue: formattedVal,
      };
    }

    return {
      ...field,
      defaultValue: formattedVal,
    };
  });
  // console.log({ populatedForm });
  return populatedForm;
}

export default populateFormInitialValues;
