const debug = require("debug")("JustAList:ReadManyAction")

/**
 * Call list.read method to set slice.items array
 *
 * @param {Function} dispatch        Redux dispatch
 * @param {Function} api             API method
 * @param {Function} onChange        Appy on items array before changing state
 *
 * @param {object}   query           Control/Filter attributes
 * @param {boolean}  opt.shouldClear If true, method result will replace existing items.
 * Otherwise, merge both arrays by id
 * @param {object}   opt.rest        Other options passed when calling list instance .read
 *
 * @returns {Promise<object<error, result>>}
 */
export const readManyAction = ({ listName, dispatch, api, onChange }) => (
  query = {},
  { isSilent = false, shouldClear = true, ...rest } = {}
) => {
  if (!isSilent) {
    dispatch({
      type: `${listName}_READ-MANY_START`,
    })
  }

  return Promise.resolve()
    .then(() => api(query, { shouldClear, ...rest }))
    .then(result => {
      dispatch({
        type: `${listName}_READ-MANY_END`,
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
        type: `${listName}_READ-MANY_ERROR`,
        payload: error,
      })

      return { error }
    })
}
