const debug = require("debug")("ReduxList:Create")

import { findWith, isNothing, map, reduce, hasWith, is } from "@mutantlove/m"

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
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => async (data, ...rest) => {
  dispatch({
    type: actionStart,
    payload: data,
  })

  // Resolve promise on both success and error with {result, error} obj
  try {
    const result = await api(data, ...rest)

    dispatch({
      type: actionSuccess,
      payload: result,
    })

    return { result }
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

    return { error: stateError }
  }
}

export const createStartReducer = (state, payload) => ({
  ...state,
  creating: Array.isArray(payload) ? payload : [payload],
})

export const createSuccessReducer = (state, payload) => {
  const items = Array.isArray(payload) ? payload : [payload]
  const itemWithoutId = findWith({
    id: isNothing,
  })(items)

  if (is(itemWithoutId)) {
    throw new TypeError(
      `createSuccessReducer: trying to create item "${itemWithoutId}" without id property`
    )
  }

  return {
    ...state,

    // if exists, replace, else add to end of array
    items: reduce((acc, item) => {
      const exists = hasWith({ id: item.id })(state.items)

      if (exists) {
        debug(
          `createSuccessReducer: ID "${item.id}" already exists, replacing`,
          {
            createdItem: item,
            existingItems: state.items,
          }
        )
      }

      return exists
        ? map(mItem => (mItem.id === item.id ? item : mItem))(acc)
        : [...acc, item]
    }, state.items)(items),

    // reset error after successfull action
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
