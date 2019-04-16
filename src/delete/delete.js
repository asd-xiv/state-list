const debug = require("debug")("ReduxAllIsList:Delete")

import { filterBy, findBy, is, hasWith } from "@asd14/m"

/**
 * Call API to delete an item, dispatch events before and after
 *
 * @param  {Object}    cache          Cache store
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
export const deleteAction = ({
  cache,
  dispatch,
  api,
  actionStart,
  actionSuccess,
  actionError,
}) => id => {
  dispatch({
    type: actionStart,
    payload: id,
  })

  // Resolve promise on both success and error with {result, error} obj
  return new Promise(async resolve => {
    try {
      const result = await api(id)

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
 * Enable UI flag for removing item
 *
 * @param  {Object}  state  The state
 * @param  {Object}  id     Deleting item id
 *
 * @return {Object}  New slice state
 */
export const deleteStartReducer = (state, id) => {
  const deletingItem = findBy({ id })(state.deleting)

  is(deletingItem) &&
    debug(
      "deleteStartReducer: ID already deleting, doing nothing (will still trigger a rerender)",
      {
        deletingItem,
        deleting: state.deleting,
      }
    )

  return {
    ...state,
    deleting: is(deletingItem)
      ? state.deleting
      : [...state.deleting, findBy({ id })(state.items)],
  }
}

/**
 * Remove item from items array
 *
 * @param  {Object}  state    The state
 * @param  {Object}  item     Payload
 *
 * @return {Object}
 */
export const deleteSuccessReducer = (state, item) => {
  const hasId = Object.prototype.hasOwnProperty.call(item, "id")

  if (!hasId) {
    throw new TypeError(
      `deleteSuccessReducer: cannot delete item "${item}" without id property`
    )
  }

  if (!hasWith({ id: item.id })(state.items)) {
    debug(
      `deleteSuccessReducer: ID "${
        item.id
      }" does not exist, doing nothing (will still trigger a rerender)`,
      {
        deletedItem: item,
        existingItems: state.items,
      }
    )
  }

  return {
    ...state,
    items: filterBy({ "!id": item.id })(state.items),
    deleting: filterBy({ "!id": item.id })(state.deleting),
    errors: {
      ...state.errors,
      delete: null,
    },
  }
}

export const deleteErrorReducer = (state, error = {}) => ({
  ...state,
  errors: {
    ...state.errors,
    delete: error,
  },
  deleting: [],
})
