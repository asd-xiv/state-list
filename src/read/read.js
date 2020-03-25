const debug = require("debug")("ReduxList:ReadAction")

/**
 * Call list.read method to set slice.items array
 *
 * @param {Function} dispatch    Redux dispatch
 * @param {Function} api         API method
 * @param {String}   actionStart Dispatch before API call
 * @param {String}   actionEnd   Dispatch after successfull API call
 * @param {String}   actionError Dispatched after failed API call
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
  dispatch,
  api,
  actionStart,
  actionEnd,
  actionError,
  onChange,
}) => (query = {}, { shouldClear = true, ...rest } = {}) => {
  dispatch({
    type: actionStart,
  })

  return Promise.resolve()
    .then(() => api(query, { shouldClear, ...rest }))
    .then(result => {
      dispatch({
        type: actionEnd,
        payload: {
          items: Array.isArray(result) ? result : [result],
          shouldClear,
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
