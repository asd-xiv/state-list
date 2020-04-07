const debug = require("debug")("ReduxList:ReadAction")

/**
 * Call list.read method to set slice.items array
 *
 * @param {Function} dispatch    Redux dispatch
 * @param {Function} api         API method
 * @param {Function} onChange    Appy on items array before changing state
 *
 * @param {Object}  query           Control/Filter attributes
 * @param {Boolean} opt.shouldClear If true, method result will replace existing
 *                                  items. Otherwise, merge both arrays by id
 * @param {Object}  opt.rest        Other options passed when calling list
 *                                  instance .read
 *
 * @return {Promise<Object<error, result>>}
 */
export const readAction = ({
  listName,
  dispatch,
  api,
  hasDispatchStart,
  hasDispatchEnd,
  onChange,
}) => (query = {}, { shouldClear = true, ...rest } = {}) => {
  if (hasDispatchStart) {
    dispatch({
      type: `${listName}_READ_START`,
    })
  }

  return Promise.resolve()
    .then(() => api(query, { shouldClear, ...rest }))
    .then(result => {
      if (hasDispatchEnd) {
        dispatch({
          type: `${listName}_READ_END`,
          payload: {
            items: Array.isArray(result) ? result : [result],
            shouldClear,
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
        type: `${listName}_READ_ERROR`,
        payload: error,
      })

      return { error }
    })
}
