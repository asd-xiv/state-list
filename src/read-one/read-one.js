const debug = require("debug")("JustAList:ReadOneAction")

import { hasKey, isEmpty } from "m.xyz"

/**
 * Call list.readOne method to add/update item in slice.items
 *
 * @param {String}   listName    Slice name - for error messages
 * @param {Function} dispatch    Redux dispatch
 * @param {Function} api         API method
 * @param {Function} onChange    Appy on items array before changing state
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
  hasDispatchStart,
  hasDispatchEnd,
  onChange,
}) => (id, ...args) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `JustAList: "${listName}".readOne ID param missing. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  if (hasDispatchStart) {
    dispatch({
      type: `${listName}_READ-ONE_START`,
      payload: id,
    })
  }

  return Promise.resolve()
    .then(() => api(id, ...args))
    .then(result => {
      if (hasDispatchEnd) {
        dispatch({
          type: `${listName}_READ-ONE_END`,
          payload: {
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
        type: `${listName}_READ-ONE_ERROR`,
        payload: error,
      })

      return { error }
    })
}
