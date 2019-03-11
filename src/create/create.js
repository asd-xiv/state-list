const debug = require("debug")("ReduxCollections:Create")

import { map, hasWith, is } from "@leeruniek/functies"

/**
 * Call API to create item. Dispatch actions before, after success and after
 * error
 *
 * @param  {Function}  dispatch       Redux dispatch
 * @param  {Function}  api            API method
 * @param  {string}    actionStart    Action before API call
 * @param  {string}    actionSuccess  Action after success
 * @param  {string}    actionError    Action after error
 *
 * @param  {Object}  data  Model data
 *
 * @return {Promise<Object>}
 */
export const createAction = ({
  cache,
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => data => {
  dispatch({
    type: actionStart,
    payload: data,
  })

  // Resolve promise on both success and error with {result, error} obj
  return new Promise(async resolve => {
    try {
      const result = await api(data)

      dispatch({
        type: actionSuccess,
        payload: result,
      })

      resolve({ result })
    } catch (error) {
      // wrapping here and not in the reducer so that both resolved error and
      // state error match
      const stateError = {
        date: new Date(),
        data: {
          name: error.name,
          message: error.message,
          status: error.status,
          body: error.body,
        },
      }

      dispatch({
        type: actionError,
        payload: stateError,
      })

      resolve({ error: stateError })
    }
  }).finally(() => {
    is(cache) && cache.clear()
  })
}

/**
 * Modify state to indicate an item is being created
 *
 * @param {Object}  state  Old state
 * @param {Object}  item   Item to be created
 *
 * @return {Object} New state
 */
export const createStartReducer = (state, item) => ({
  ...state,
  creating: item,
  isCreating: true,
})

/**
 * Add newly created item to list
 *
 * @param  {Object}  state  Old state
 * @param  {Object}  item   Newly created item
 *
 * @return {Object} New state
 */
export const createSuccessReducer = (state, item) => {
  const hasId = Object.prototype.hasOwnProperty.call(item, "id")

  if (!hasId) {
    throw new TypeError(
      `createSuccessReducer: trying to create item "${item}" without id property`
    )
  }

  const exists = hasWith({ id: item.id })(state.items)

  if (exists) {
    debug(`createSuccessReducer: ID "${item.id}" already exists, replacing`, {
      createdItem: item,
      existingItems: state.items,
    })
  }

  return {
    ...state,

    // if exists, replace, else add to end of array
    items: exists
      ? map(mItem => (mItem.id === item.id ? item : mItem))(state.items)
      : [...state.items, item],

    // reset action error
    errors: {
      ...state.errors,
      create: null,
    },

    creating: [],
  }
}

export const createErrorReducer = (state, error = {}) => ({
  ...state,
  errors: {
    ...state.errors,
    create: error,
  },
  creating: [],
})
