const debug = require("debug")("ReduxList:ReadOne")

import { hasKey, map, push, merge, when, hasWith, isEmpty } from "@mutantlove/m"

/**
 * Call API to fetch one item, dispatch events before and after
 *
 * @param  {Function}  dispatch         Redux dispatch
 * @param  {Function}  api              API method
 * @param  {string}    actionStartName  Action dispatched before API call
 * @param  {string}    actionEndName    Action dispatched after API call
 *
 * @returns {Object[]}
 */
export const readOneAction = ({
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => async (id, ...args) => {
  if (isEmpty(id)) {
    throw new TypeError(
      `ReduxList: readOneAction - cannot call readOne method without a valid "id" param. Expected something, got "${JSON.stringify(
        id
      )}"`
    )
  }

  dispatch({
    type: actionStart,
    payload: id,
  })

  try {
    const result = await api(id, ...args)

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

export const readOneStartReducer = (state, id) => ({
  ...state,
  reading: id,
})

export const readOneSuccessReducer = (state, payload) => ({
  ...state,
  items: when(
    hasWith({ id: payload.id }),
    map(item => (item.id === payload.id ? merge(item, payload) : item)),
    push(payload)
  )(state.items),
  reading: null,
  errors: {
    ...state.errors,
    readOne: null,
  },
})

export const readOneErrorReducer = (state, error = {}) => ({
  ...state,
  errors: {
    ...state.errors,
    readOne: error,
  },
  reading: null,
})
