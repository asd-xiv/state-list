const debug = require("debug")("ReduxAllIsList:Update")

import { map, filterBy, merge, hasWith, is } from "@asd14/m"

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
  cache,
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => (id, data) => {
  dispatch({
    type: actionStart,
    payload: {
      id,
      data,
    },
  })

  // Resolve promise on both success and error with {result, error} obj
  return new Promise(async resolve => {
    try {
      const result = await api(id, data)

      dispatch({
        type: actionSuccess,
        payload: result,
      })

      resolve({ result })
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

      resolve({ error: stateError })
    }
  }).finally(() => {
    is(cache) && cache.clear()
  })
}

/**
 * Modify state to indicate one item in list is being updated
 *
 * @param  {Object}         state  Old state
 * @param  {number|string}  id     Updating item ID
 * @param  {Object}         data   Updating item data
 *
 * @return {Object} New state
 */
export const updateStartReducer = (state, { id, data }) => {
  const isAlreadyUpdating = hasWith({ id })(state.updating)

  isAlreadyUpdating &&
    debug(
      "updateStartReducer: ID already updating, doing nothing (will still trigger a rerender)",
      {
        id,
        updating: state.updating,
      }
    )

  return {
    ...state,
    updating: isAlreadyUpdating
      ? state.updating
      : [...state.updating, { id, data }],
  }
}

/**
 * Update existing item by id in state list
 *
 * @param {Object}  state    Current state
 * @param {Object}  payload  Updated item data (needs id field)
 *
 * @return {Object}
 */
export const updateSuccessReducer = (state, payload) => {
  const hasId = Object.prototype.hasOwnProperty.call(payload, "id")

  if (!hasId) {
    throw new TypeError(
      `updateSuccessReducer: cannot update item "${JSON.stringify(
        payload
      )}" without id property`
    )
  }

  if (hasWith({ id: payload.id })(state.items)) {
    debug(
      `updateSuccessReducer: ID "${
        payload.id
      }" does not exist, doint nothing (will still trigger a rerender)`,
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
    updating: filterBy({ "!id": payload.id })(state.updating),
    errors: {
      ...state.errors,
      update: null,
    },
  }
}

export const updateErrorReducer = (state, error = {}) => ({
  ...state,
  errors: {
    ...state.errors,
    update: error,
  },
  updating: [],
})
