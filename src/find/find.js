const debug = require("debug")("ReduxCollections:Find")

import { is } from "@leeruniek/functies"

/**
 * Call API to fetch items, dispatch events before and after
 *
 * @param  {Object}    cache            Cache store used when cacheTTL is set
 * @param  {number}    cacheTTL         Valid duration (milliseconds)
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  api              API method
 * @param  {string}    actionStartName  Action dispatched before API call
 * @param  {string}    actionEndName    Action dispatched after API call
 *
 * @returns {Object[]}
 */
export const findAction = ({
  cache,
  dispatch,
  method,
  actionStart,
  actionEnd,
}) => (...args) => {
  const cachedResults = is(cache) ? cache.get(args) : undefined

  if (cachedResults !== undefined) {
    dispatch({
      type: actionEnd,
      payload: {
        items: Array.isArray(cachedResults) ? cachedResults : [cachedResults],
      },
    })

    return Promise.resolve(cachedResults)
  }

  dispatch({
    type: actionStart,
  })

  return Promise.resolve(method(...args)).then(results => {
    dispatch({
      type: actionEnd,
      payload: {
        items: Array.isArray(results) ? results : [results],
      },
    })

    is(cache) && cache.set(args, results)

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
