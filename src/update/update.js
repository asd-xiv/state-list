const debug = require("debug")("ReduxList:Update")

import { map, merge, isEmpty, hasWith, hasKey } from "@mutantlove/m"

/**
 * Call API to update an item, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  api              API method
 * @param  {string}    actionStartName  Action dispatched before API call
 * @param  {string}    actionEndName    Action dispatched after API call
 *
 * @return {Promise<Object>}
 */
export const updateAction = ({
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => async (id, data, ...rest) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `ReduxList: updateAction - cannot call update method without a valid "id" param. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  dispatch({
    type: actionStart,
    payload: { id, data },
  })

  // Resolve promise on both success and error with {result, error} obj
  try {
    const result = await api(id, data, ...rest)

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

export const updateStartReducer = (state, { id, data }) => ({
  ...state,
  updating: { id, data },
})

export const updateSuccessReducer = (state, payload) => {
  if (hasWith({ id: payload.id })(state.items)) {
    debug(
      `updateSuccessReducer: ID "${payload.id}" does not exist, doint nothing (will still trigger a rerender)`,
      {
        payload,
        existingItems: state.items,
      }
    )
  }

  return {
    ...state,
    items: map(item => (item.id === payload.id ? merge(item, payload) : item))(
      state.items
    ),
    updating: {},
    errors: {
      ...state.errors,
      update: null,
    },
  }
}

export const updateErrorReducer = (state, error = {}) => ({
  ...state,
  updating: {},
  errors: {
    ...state.errors,
    update: error,
  },
})
