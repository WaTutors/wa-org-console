exports.generatePropertyMainAgGridColumns = (columnsToHide) => [
  {
    headerName: 'Vertical', field: 'vertical', flex: 0.4,
  },
  {
    headerName: 'Name', field: 'name', flex: 1,
  },
  {
    headerName: 'Length', field: 'length', flex: 0.1,
  },
  {
    headerName: 'Price', field: 'price', flex: 0.1,
  },
  {
    headerName: 'Edit',
    cellRenderer: 'editButton',
    sortable: false,
    suppressMenu: true,
    resizable: false,
    flex: 0.1,
  },
  {
    headerName: 'Delete',
    cellRenderer: 'deleteButton',
    flex: 0.1,
    sortable: false,
    suppressMenu: true,
    resizable: false,
  },
].filter((colObj) => {
  if (columnsToHide)
    return !columnsToHide.includes(colObj.field);
  return true;
});

const displayNames = {
  Tutor: 'School and Test Subjects',
  Skill: 'Hobbies and Skills',
  Fit: 'Health, Fitness, and Wellness',
  Personal: 'Personal and Planning',
  Home: 'Home Services',
  Biz: 'Professional and Business',
  Tech: 'Technology',
};

/**
 * parses database group object into something to be displayed
 *
 * @see generateGroupMainAgGridColumns associated columns
 *
 * @param {object} item session object
 * @returns {object}
 */
exports.mapPropertyMainAgGridRows = (item) => ({
  vertical: displayNames[item.split('_')[0]] || '',
  name: item.split('_')[1] || item,
  length: item.split('_')[2] || '',
  price: `$${item.split('_')[3] || ''}`,
  id: item,
});
