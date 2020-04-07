const debug = require("debug")("ReduxList:UpdateAction")

import { isEmpty, hasKey } from "@mutant-ws/m"

/**
 * Call list.update method to change existing item in slice.items
 *
 * @param {String}   listName    Slice name - for error messages
 * @param {Function} dispatch    Redux dispatch
 * @param {Function} api         API method
 * @param {Function} onChange    Appy on items array before changing state
 *
 * @param {string|number} id   Id of item to update
 * @param {Array}         rest Other paramaters passed when calling list.update
 *
 * @return {Promise<Object<error, result>>}
 */
export const updateAction = ({
  listName,
  dispatch,
  api,
  hasDispatchStart,
  hasDispatchEnd,
  onChange,
}) => (id, data, ...rest) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `ReduxList: "${listName}".update ID param missing. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  if (isEmpty(data)) {
    throw new TypeError(
      `ReduxList: "${listName}".update DATA param is empty. Expected non empty object, got "${JSON.stringify(
        data
      )}"`
    )
  }

  if (hasDispatchStart) {
    dispatch({
      type: `${listName}_UPDATE_START`,
      payload: { id, data },
    })
  }

  return Promise.resolve()
    .then(() => api(id, data, ...rest))
    .then(result => {
      if (hasDispatchEnd) {
        dispatch({
          type: `${listName}_UPDATE_END`,
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
        type: `${listName}_UPDATE_ERROR`,
        payload: error,
      })

      return { error }
    })
}
