const debug = require("debug")("ReduxList:RemoveAction")

import { isEmpty, hasKey } from "@mutant-ws/m"

/**
 * Call list.remove method to remove item from slice.items
 *
 * @param {String}   listName    Slice name - for error messages
 * @param {Function} dispatch    Redux dispatch
 * @param {Function} api         API method
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
  hasDispatchStart,
  hasDispatchEnd,
  onChange,
}) => (id, ...rest) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `ReduxList: "${listName}".remove ID param missing. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  if (hasDispatchStart) {
    dispatch({
      type: `${listName}_REMOVE_START`,
      payload: id,
    })
  }

  return Promise.resolve()
    .then(() => api(id, ...rest))
    .then(result => {
      if (hasDispatchEnd) {
        dispatch({
          type: `${listName}_REMOVE_END`,
          payload: {
            listName,
            item: {
              ...result,
              id: hasKey("id")(result) ? result.id : id,
            },
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
        type: `${listName}_REMOVE_ERROR`,
        payload: error,
      })

      return { error }
    })
}
