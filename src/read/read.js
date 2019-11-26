const debug = require("debug")("ReduxList:Read")

import {
  pipe,
  push,
  hasWith,
  flatten,
  reduce,
  when,
  merge,
  map,
} from "@mutantlove/m"

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
export const readAction = ({
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => (query = {}, { shouldClear = true, ...rest } = {}) => {
  dispatch({
    type: actionStart,
  })

  return Promise.resolve()
    .then(() => api(query, { shouldClear, ...rest }))
    .then(result => {
      dispatch({
        type: actionSuccess,
        payload: {
          items: Array.isArray(result) ? result : [result],
          shouldClear,
        },
      })

      return { result }
    })
    .catch(error => {
      // reducer and this promise resolve with the same data
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
    })
}

export const readStartReducer = state => ({
  ...state,
  isLoading: true,
})

export const readSuccessReducer = (state, { items, shouldClear }) => ({
  ...state,
  items: shouldClear
    ? items
    : pipe(
        flatten,
        reduce(
          (acc, accItem) =>
            when(
              hasWith({ id: accItem.id }),
              map(item =>
                item.id === accItem.id ? merge(item, accItem) : item
              ),
              push(accItem)
            )(acc),
          []
        )
      )([state.items, items]),
  loadDate: new Date(),
  isLoading: false,
})

export const readErrorReducer = (state, error = {}) => ({
  ...state,
  errors: {
    ...state.errors,
    read: error,
  },
  items: [],
  isLoading: false,
})
