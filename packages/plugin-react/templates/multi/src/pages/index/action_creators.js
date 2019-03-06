import { RECORD_UPDATE } from './action_types';
// 不请求服务器数据，单独更新某条数据
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
