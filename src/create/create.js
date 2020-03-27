const debug = require("debug")("ReduxList:CreateAction")

/**
 * Call list.create method to add result to slice.items
 *
 * @param {String}   listName    Slice name - for error messages
 * @param {Function} dispatch    Redux dispatch
 * @param {Function} api         API method
 * @param {String}   actionStart Dispatch before API call
 * @param {String}   actionEnd   Dispatch after successfull API call
 * @param {String}   actionError Dispatch after failed API call
 * @param {Function} onChange    Appy on items array before changing state
 *
 * @param {Object} data Model data
 * @param {Array}  rest Other paramaters passed when calling list.create
 *
 * @return {Promise<Object<error, result>>}
 */
export const createAction = ({
  listName,
  dispatch,
  api,
  actionStart,
  actionEnd,
  actionError,
  hasSocket,
  onChange,
}) => (data, ...rest) => {
  dispatch({
    type: actionStart,
    payload: {
      listName,
      items: Array.isArray(data) ? data : [data],
    },
  })

  return Promise.resolve()
    .then(() => api(data, ...rest))
    .then(result => {
      // - If present, websocket is responsable for keeping state in sync
      // - Save a redundant state update
      // - If both sources create an item with the same id, one of them will
      // throw
      if (!hasSocket) {
        dispatch({
          type: actionEnd,
          payload: {
            listName,
            items: Array.isArray(result) ? result : [result],
            onChange,
          },
        })
      }

      return { result }
    })
    .catch(error => {
      // reducer and promise resolve the same data
      error.date = new Date()

      dispatch({
        type: actionError,
        payload: error,
      })

      return { error }
    })
}
