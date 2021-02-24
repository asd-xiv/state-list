const debug = require("debug")("JustAList:UpdateAction")

import { isEmpty, get } from "@asd14/m"

/**
 * Call list.update method to change existing item in slice.items
 *
 * @param {string}   listName Slice name - for error messages
 * @param {Function} dispatch Redux dispatch
 * @param {Function} api      API method
 * @param {Function} onChange Appy on items array before changing state
 *
 * @param {string|number} id   Id of item to update
 * @param {Array}         rest Other paramaters passed when calling list.update
 *
 * @returns {Promise<{error, result}>}
 */
export const updateAction = ({
  listName,
  dispatch,
  api,
  hasDispatchStart,
  hasDispatchEnd,
  onMerge,
  onChange,
}) => (id, data = {}, options = {}) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `JustAList: "${listName}".update ID param missing. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  if (isEmpty(data)) {
    throw new TypeError(
      `JustAList: "${listName}".update DATA param is empty. Expected non empty object, got "${JSON.stringify(
        data
      )}"`
    )
  }

  if (hasDispatchStart) {
    dispatch({
      type: `${listName}_UPDATE_START`,
      payload: {
        id,
        data,
        isOptimist: options.isOptimist,
        onMerge,
        onChange,
      },
    })
  }

  return Promise.resolve()
    .then(() => api(id, data, options))
    .then(result => {
      if (hasDispatchEnd) {
        dispatch({
          type: `${listName}_UPDATE_END`,
          payload: {
            listName,
            item: {
              ...result,
              id: get("id", id)(result),
            },
            onMerge,
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
        type: `${listName}_UPDATE_ERROR`,
        payload: {
          id,
          error,
          isOptimist: options.isOptimist,
        },
      })

      return { error }
    })
}
