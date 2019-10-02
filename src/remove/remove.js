const debug = require("debug")("ReduxList:Remove")

import { filterWith, findWith, isEmpty, hasWith, hasKey } from "@mutantlove/m"

/**
 * Call API to delete an item, dispatch events before and after
 *
 * @param  {Function}  dispatch       Redux dispatch
 * @param  {Function}  api            API method
 * @param  {string}    actionStart    Action before API call
 * @param  {string}    actionSuccess  Action after success
 * @param  {string}    actionError    Action after error
 *
 * @param  {string|number} id  Id of item to delete
 *
 * @return {Object}
 */
export const removeAction = ({
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => async (id, ...rest) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `ReduxList: removeAction - cannot call remove method without a valid "id" param. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  dispatch({
    type: actionStart,
    payload: id,
  })

  // Resolve promise on both success and error with {result, error} obj
  try {
    const result = await api(id, ...rest)

    dispatch({
      type: actionSuccess,
      payload: {
        ...result,
        id: hasKey("id")(result) ? result.id : id,
      },
    })

    return { result }
  } catch (error) {
    // wrapping here so that both reducer and this current promise
    // resolve/pass the same data
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

export const removeStartReducer = (state, id) => ({
  ...state,
  removing: [findWith({ id })(state.items)],
})

export const removeSuccessReducer = (state, item) => {
  if (!hasWith({ id: item.id })(state.items)) {
    debug(
      `removeSuccessReducer: ID "${item.id}" does not exist, doing nothing (will still trigger a rerender)`,
      {
        deletedItem: item,
        existingItems: state.items,
      }
    )
  }

  return {
    ...state,
    items: filterWith({ "!id": item.id })(state.items),
    errors: {
      ...state.errors,
      remove: null,
    },
    removing: [],
  }
}

export const removeErrorReducer = (state, error = {}) => ({
  ...state,
  errors: {
    ...state.errors,
    remove: error,
  },
  removing: [],
})
