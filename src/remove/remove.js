const debug = require("debug")("JustAList:RemoveAction")

import { isEmpty, get } from "@asd14/m"

/**
 * Call list.remove method to remove item from slice.items
 *
 * @param {string}   listName Slice name - for error messages
 * @param {Function} dispatch Redux dispatch
 * @param {Function} api      API method
 * @param {Function} onChange Appy on items array before changing state
 *
 * @param {string|number} id   Id of item to delete
 * @param {Array}         rest Other paramaters passed when calling list instance .remove
 *
 * @returns {Promise<{error, result}>}
 */
export const removeAction = ({
  listName,
  dispatch,
  api,
  hasDispatchStart,
  hasDispatchEnd,
  onChange,
}) => (id, options = {}) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `JustAList: "${listName}".remove ID param missing. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  if (hasDispatchStart) {
    dispatch({
      type: `${listName}_REMOVE_START`,
      payload: {
        id,
        isOptimist: options.isOptimist,
      },
    })
  }

  return Promise.resolve()
    .then(() => api(id, options))
    .then(result => {
      if (hasDispatchEnd) {
        dispatch({
          type: `${listName}_REMOVE_END`,
          payload: {
            id: get("id", id)(result),
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
        payload: {
          id,
          error,
          isOptimist: options.isOptimist,
        },
      })

      return { error }
    })
}
