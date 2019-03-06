import { UPDATE_SIZE } from './action_type';

const updateTableSize = width => dispatch => {
  dispatch({
    type: UPDATE_SIZE,
    data: {
      tableWidth: width,
    },
  });
};

export default {
  updateTableSize,
};
