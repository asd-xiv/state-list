const debug = require("debug")("ReduxAllIsList:Find")

/**
 * Call API to fetch items, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  api              API method
 * @param  {string}    actionStartName  Action dispatched before API call
 * @param  {string}    actionEndName    Action dispatched after API call
 *
 * @returns {Object[]}
 */
export const findAction = ({ dispatch, api, actionStart, actionEnd }) => (
  ...args
) => {
  dispatch({
    type: actionStart,
  })

  return Promise.resolve(api(...args)).then(results => {
    dispatch({
      type: actionEnd,
      payload: {
        items: Array.isArray(results) ? results : [results],
      },
    })

    return results
  })
}

/**
 * Modify state to indicate the list is being loaded
 *
 * @param {Object}  state  Old state
 *
 * @return {Object} New state
 */
export const findStartReducer = state => ({
  ...state,
  isLoading: true,
})

/**
 * Add newly received items
 *
 * @param {Object}    state  Old state
 * @param {Object[]}  items  List of items
 *
 * @return {Object} New state
 */
export const findEndReducer = (state, { items }) => ({
  ...state,
  items,
  loadDate: new Date(),
  isLoading: false,
})
