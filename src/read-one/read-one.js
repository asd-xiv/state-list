const debug = require("debug")("ReduxList:ReadOneAction")

import { hasKey, isEmpty } from "@mutant-ws/m"

/**
 * Call list.readOne method to add/update item in slice.items
 *
 * @param {String}   listName    Slice name - for error messages
 * @param {Function} dispatch    Redux dispatch
 * @param {Function} api         API method
 * @param {String}   actionStart Dispatch before API call
 * @param {String}   actionEnd   Dispatch after successfull API call
 * @param {String}   actionError Dispatched after failed API call
 * @param {Function} onChange    Appy on items array before changing state
 *
 *
 * @param {string|number} id   Id of item to update or add
 * @param {Array}         rest Other paramaters passed when calling list
 *                             instance .readOne
 *
 * @return {Promise<Object<error, result>>}
 */
export const readOneAction = ({
  listName,
  dispatch,
  api,
  actionStart,
  actionEnd,
  actionError,
  onChange,
}) => (id, ...args) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `ReduxList: "${listName}".readOne ID param missing. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  dispatch({
    type: actionStart,
    payload: id,
  })

  return Promise.resolve()
    .then(() => api(id, ...args))
    .then(result => {
      dispatch({
        type: actionEnd,
        payload: {
          item: {
            ...result,
            id: hasKey("id")(result) ? result.id : id,
          },
          onChange,
        },
      })

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
