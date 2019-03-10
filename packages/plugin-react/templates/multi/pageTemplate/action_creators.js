import { RECORD_UPDATE } from './action_types';

function updateRecord(id, data) {
  return dispatch => {
    dispatch({
      type: RECORD_UPDATE,
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
