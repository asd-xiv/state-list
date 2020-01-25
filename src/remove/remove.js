const debug = require("debug")("ReduxList:RemoveAction")

import { isEmpty, hasKey } from "@mutantlove/m"

/**
 * Call list.remove method to remove item from slice.items
 *
 * @param {String}   listName    Slice name - for error messages
 * @param {Function} dispatch    Redux dispatch
 * @param {Function} api         API method
 * @param {String}   actionStart Dispatch before API call
 * @param {String}   actionEnd   Dispatch after successfull API call
 * @param {String}   actionError Dispatch after failed API call
 * @param {Function} onChange    Appy on items array before changing state
 *
 * @param {string|number} id   Id of item to delete
 * @param {Array}         rest Other paramaters passed when calling list
 *                             instance .remove
 *
 * @return {Promise<Object<error, result>>}
 */
export const removeAction = ({
  listName,
  dispatch,
  api,
  actionStart,
  actionEnd,
  actionError,
  onChange,
}) => (id, ...rest) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `ReduxList: "${listName}".remove ID param missing. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  dispatch({
    type: actionStart,
    payload: id,
  })

  return Promise.resolve()
    .then(() => api(id, ...rest))
    .then(result => {
      dispatch({
        type: actionEnd,
        payload: {
          listName,
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
      const stateError = {
        date: new Date(),
        data: {
          name: error.name,
          message: error.message,
          status: error.status,
          body: error.body,
        },
      }

      dispatch({
        type: actionError,
        payload: stateError,
      })

      return { error: stateError }
    })
}
