import types from './action_types';

function updateRecord(id, data) {
  return dispatch => {
    dispatch({
      type: types.RECORD_UPDATE,
      data: {
        id,
        data,
      },
    });
  };
}

export default {
  updateRecord,
};
