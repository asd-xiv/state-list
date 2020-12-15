const debug = require("debug")("JustAList:CreateAction")

/**
 * Call list.create method to add result to slice.items
 *
 * @param {string}   listName Slice name - for error messages
 * @param {Function} dispatch Redux dispatch
 * @param {Function} api      API method
 * @param {Function} onChange Appy on items array before changing state
 *
 * @param {object}   data     Model data
 * @param {Array}    rest     Other paramaters passed when calling list.create
 *
 * @returns {Promise<object<error, result>>}
 */
export const createAction = ({ listName, dispatch, api, onChange }) => (
  data,
  { isSilent, ...options }
) => {
  if (!isSilent) {
    dispatch({
      type: `${listName}_CREATE_START`,
      payload: {
        listName,
        items: Array.isArray(data) ? data : [data],
      },
    })
  }

  return Promise.resolve()
    .then(() => api(data, options))
    .then(result => {
      dispatch({
        type: `${listName}_CREATE_END`,
        payload: {
          listName,
          items: Array.isArray(result) ? result : [result],
          onChange,
        },
      })

      return { result }
    })
    .catch(error => {
      // reducer and promise resolve the same data
      error.date = new Date()

      dispatch({
        type: `${listName}_CREATE_ERROR`,
        payload: error,
      })

      return { error }
    })
}
