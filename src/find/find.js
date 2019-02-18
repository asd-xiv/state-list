const debug = require("debug")("ReduxAllIsList:Find")

/**
 * Call API to fetch items, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  apiMethod        API call
 * @param  {string}    actionStartName  Action dispatched before API
 * @param  {string}    actionEndName    Action dispatched after API
 *
 * @returns {Object[]}
 */
export const findAction = ({
  dispatch,
  apiMethod,
  actionStartName,
  actionEndName,
}) => (...args) => {
  dispatch({
    type: actionStartName,
  })

  return Promise.resolve(apiMethod(...args)).then(items => {
    dispatch({
      type: actionEndName,
      payload: {
        items: Array.isArray(items) ? items : [items],
      },
    })

    return items
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
